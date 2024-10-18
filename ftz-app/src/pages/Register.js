import { useState } from "react";
import { register } from "../firebase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Hata durumunu tutmak için

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(email, password);
      console.log(user);
      // Başarılı kayıt sonrası yapılacak işlemler (örneğin yönlendirme)
    } catch (err) {
      setError("Kayıt işlemi başarısız. Lütfen tekrar deneyin."); // Hata mesajı ayarla
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-column">
      <input
        type="text"
        placeholder="E-posta adresi"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Parola"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button disabled={!email || !password} type="submit">
        Kayıt Ol
      </button>
      {error && <p className="text-red-500">{error}</p>} {/* Hata mesajı */}
    </form>
  );
}
