import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false }); //socialOnly는 깃헙 로그인을 위해서 작성한거다.
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};
/*이 컨트롤러의 목적은 몇몇 configuration parameter를 가지고 url 만들기 */
export const startGithubLogin = (req, res) => {
  /*base와 parameter연결  */
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  /*finalUrl을 만들고 여기로 user를 보내주었다. */
  const finalUrl = `${baseUrl}?${params}`;
  /*usr를 깃허브로 보냈다.*/
  return res.redirect(finalUrl);
};
/*우리가 url을 설정하는 이유는 깃 허브에 뭔가를 알려주기 위해서이다.
scope에서는 user로 뭘 할지를 설정 */
/*깃허브가 이 데이터를 공유하는데 동의를 하면 우리 웹사이트로 돌아온다.
localhost:4000/users/github/finish 이 url은 우리가 만든게 아니라 깃허브에서 만든거다. */
/*----------------------------------------------------------------------------------------*/
/*먼저 user가 깃허브에서 돌아오면 url에 code=xxxx가 덧붙여진 내용을 받는다.
이 code는 user가 승인했다고 깃허브가 알려준느 거다. */
export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  /*parameter들을 URL의 parameter string으로 바꿀거다. */
  const params = new URLSearchParams(config).toString();
  /*새로운 URl */
  const finalUrl = `${baseUrl}?${params}`;
  /*새로운 url로 post request 보내기 */
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ) /*모든 것이 올바르다면 깃허브가 우리에게 access_token을 준다. */
    /*엑세스 토큰은 깃허브 api와 상호작용 할 때 사용 */
    .json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    /*요청은 https://api.github.com로 간다*/
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    /*email을 안 보내주는 경우 이메일 요청 */
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    /*이메일 array를 준다. */
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    /*db에서 해당 이메일을 찾는다. */
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true /*우리가 이걸 하는 이유는 postlogin에서 이 user가 로그인 하는걸 체크할 때 socialy가
        flase인걸 확인하려고 하는거다. socialyOnly가 true면 password가 없다는 소리 */,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};
/*이것들이 다 진행되면 쿠키가 생성된다. */

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
  /*user가 redirect되면 session이 없기 때문에 로그아웃된다. */
};

export const edit = (req, res) => res.send("Edit User");
export const see = (req, res) => res.send("see user");
