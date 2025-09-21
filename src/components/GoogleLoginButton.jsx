import { useGoogleLogin } from "@react-oauth/google";

function GoogleLoginButton() {
  const login = useGoogleLogin({
    onSuccess: tokenResponse => console.log(tokenResponse),
    onError: () => console.log("Login Failed"),
  });

  return (
    <button onClick={() => login()}>Login with Google</button>
  );
}
