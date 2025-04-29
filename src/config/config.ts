export const config = {
  backend: {
    local: "http://localhost:4000",
    remote: "https://apitut.duckdns.org",
  },
  hsbi: {
    api_url: "https://api.hivesbi.com/v1/members/",
    main_account: "steembasicincome",
  },
  templates_comments: [
    {
      name: "default_1",
      content_markdown: (username: string, onboarded_by: string) => `
      **🇪🇸 Español**

---

🎉 ¡Hola @${username} Bienvenido/a a HIVE 🎉  
Soy ${onboarded_by}, te felicito por tu participación y compromiso con esta increíble comunidad.

Como parte de una iniciativa personal, **te he inscrito en el programa:**  

![image.png](https://files.peakd.com/file/peakd-hive/theghost1980/23xpXuSLWjFPXVtEMocHCfiy7zQYFxYBaKExRzKzpu9YhumHTQBWa2ieYhTNz8feE8Jm2.png)

### 🔹 Hive Stake Based Income (Hive SBI)

> 🧪 Un experimento social que busca ofrecer una renta básica voluntaria financiada por crowdfunding, para beneficiar a tantos usuarios de Hive como sea posible.  
> 👥 Los miembros participan patrocinando a otros, y el beneficio se entrega en forma de **upvotes regulares** en sus publicaciones.

🧩 **Esta iniciativa forma parte de la comunidad [Synergy Builders](https://peakd.com/c/hive-186392/created). Pensamos, desarrollamos software y mejoramos la calidad de la web3.**  
👉 Si te interesa construir, colaborar o aprender sobre Web3, ¡te invitamos a unirte!

🔍 [Revisa tu información aquí](https://www.hivesbi.com/userinfo/?user=${username})  
<sup>*(la información se actualiza unas 3 horas después de tu inscripción)*</sup>

---

**🇬🇧 English**

---

🎉 Greetings @${username} Welcome to HIVE 🎉  
I am ${onboarded_by}, Congrats on being part of this amazing community.

As part of a personal initiative, **I’ve added you to the following program:**

![image.png](https://files.peakd.com/file/peakd-hive/theghost1980/23xpXuSLWjFPXVtEMocHCfiy7zQYFxYBaKExRzKzpu9YhumHTQBWa2ieYhTNz8feE8Jm2.png)

### 🔹 Hive Stake Based Income (Hive SBI)

> 🧪 A social experiment to provide a voluntary basic income funded by crowdfunding to as many Hivers as possible.  
> 👥 Members participate by sponsoring others. The benefit is delivered through **regular upvotes** on member content.

🧩 **This initiative is part of the [Synergy Builders](https://peakd.com/c/hive-186392/created) community. We think, build software, and improve the quality of web3.**  
👉 If you're into building, collaborating, or learning about Web3 — we’d love to have you on board!
 
🔍 [Check your info here](https://www.hivesbi.com/userinfo/?user=${username})  
<sup>*(info updates around 3 hours after registration)*</sup>

---

### 🔗 Enlaces útiles / Useful Links:

| 💬 Discord | 🏠 Página principal | 📝 Post de bienvenida | 📘 Documentación |
|:----------:|:------------------:|:---------------------:|:----------------:|
| [![discord](https://files.peakd.com/file/peakd-hive/theghost1980/ALDADjWGG2KP5CFbnyArgodA3BmFG5CNkDiszEkbjoK7KbNYpeRpxac1vGMtsUz.png)](https://discord.gg/Ypw9aqJk5A) | [![home](https://files.peakd.com/file/peakd-hive/theghost1980/AKxnGkcA1kWDmjUk4UdpMpfpH4djucBJG2ZWWwy7sw6pYZoyKbP4RbPsTJe9cDG.png)](https://www.hivesbi.com/) | [![post](https://files.peakd.com/file/peakd-hive/theghost1980/AKLv5m2e3KUKzWKXcobmuQLDFgVe7H8ym3AEGCtgxvPYMWhYHQtn7eisPW1PuNF.png)](https://peakd.com/steem/@steembasicincome/welcome-to-steem-basic-income) | [![docs](https://files.peakd.com/file/peakd-hive/theghost1980/AJkV3zgS8NECJRhwJXmN7ctZo5yw7CCYSYicoQyPFB7HYV2bU9iL8LWGqVL5XF2.png)](https://docs.hivesbi.com/) |

      `,
    },
  ],
  app_name: "hsbi-onboarder/v1",
};
