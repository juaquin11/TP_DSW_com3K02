import React from "react";

export default function Login() {
  return (
    <main style={{ padding: "1rem" }}>
      <h1>Login Page</h1>
      <form>
        <div>
          <label htmlFor="email">Email: </label>
          <input id="email" type="email" name="email" />
        </div>
        <div>
          <label htmlFor="password">Password: </label>
          <input id="password" type="password" name="password" />
        </div>
        <button type="submit">Log In</button>
      </form>
    </main>
  );
}
