// const firebaseConfig = {
//   apiKey: "AIzaSyCdoLdbRi54vKqufKZ7HKx8rLyxOjE78xM",
//   authDomain: "ftz-prtturk.firebaseapp.com",
//   projectId: "ftz-prtturk",
//   storageBucket: "ftz-prtturk.appspot.com",
//   messagingSenderId: "626209636225",
//   uygulamaId: "1:626209636225:web:d20cc36a74e4d0da00b280",
// };
// Initialize Firebase

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import toast from "react-hot-toast";
import store from "./store";
import { logout as logoutHandle } from "./store/auth";
import { openModal } from "./store/modal";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { setTodos } from "./store/todos";
import { setUserData } from "./utils";

const firebaseConfig = {
  apiKey: "AIzaSyCdoLdbRi54vKqufKZ7HKx8rLyxOjE78xM",
  authDomain: "ftz-prtturk.firebaseapp.com",
  projectId: "ftz-prtturk",
  storageBucket: "ftz-prtturk.appspot.com",
  messagingSenderId: "626209636225",
  uygulamaId: "1:626209636225:web:d20cc36a74e4d0da00b280",
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore(app);

//Kullanıcı kayıt bölümü
export const register = async (email, password) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error) {
    toast.error(error.message);
  }
};

//Kullanıcı giriş bölümü
export const login = async (email, password) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error) {
    toast.error(error.message);
  }
};

//Kullanıcı çıkış bölümü
export const logout = async () => {
  await signOut(auth);
  toast.success("Çıkış yapıldı");
};

//kullanıcı bilgilerini güncelleme
export const update = async (data) => {
  try {
    await updateProfile(auth.currentUser, data);
    toast.success("Profil güncellendi");
    return true;
  } catch (error) {
    toast.error(error.message);
  }
};
//kullanıcı durumu(login olup olmadığını kontrol ediyor)
onAuthStateChanged(auth, (user) => {
  if (user) {
    //dispatch olayını utils içerisinde tanımlayıp burada setUserData ile kullandık.
    setUserData();
    // firebase datayı okuma
    onSnapshot(
      query(
        collection(db, "todos"),
        where("uid", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc") // Artan sıraya göre sıralama
      ),
      (doc) => {
        store.dispatch(
          setTodos(
            doc.docs.reduce((todos, todo) => [...todos, { ...todo.data(), id: todo.id }], [])
          )
        );
      }
    );
  } else {
    store.dispatch(logoutHandle());
  }
});
//Kullanıcı reset password
export const resetPassword = async (password) => {
  try {
    await updatePassword(auth.currentUser, password);
    toast.success("Şifre güncellendi");
    return true;
  } catch (error) {
    if (error.code === "auth/weak-password") {
      store.dispatch(openModal({ name: "re-auth-modal" }));
    }
    toast.error(error.message);
  }
};
//Kullanıcı email doğrulama
export const emailVerification = async () => {
  try {
    await sendEmailVerification(auth.currentUser);
    toast.success(`Email doğrulama messajı ${auth.currentUser.email} adresine gönderildi `);
  } catch (error) {
    toast.error(error.message);
  }
};

//reauth
export const reAuth = async (password) => {
  try {
    const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
    const { user } = await reauthenticateWithCredential(auth.currentUser, credential);
    return user;
  } catch (error) {
    toast.error(error.message);
  }
};
//firestore veritabanına bilgi ekleme
export const addTodo = async (data) => {
  try {
    data.createdAt = serverTimestamp();
    const result = await addDoc(collection(db, "todos"), data);
    return result.id;
  } catch (error) {
    toast.error(error.message);
  }
};
//firestore veri güncelleme
export const updateTodo = async (id, data) => {
  try {
    const todoRef = doc(db, "todos", id);

    await updateDoc(todoRef, data);

    toast.success("Güncelleme işlemi başarılı!");
    return true;
  } catch (error) {
    toast.error(error.message);
  }
};

//Firestore veri silme
export const deleteTodo = async (id) => {
  try {
    return await deleteDoc(doc(db, "todos", id));
  } catch (error) {
    toast.error(error.message);
  }
};
export default app;
