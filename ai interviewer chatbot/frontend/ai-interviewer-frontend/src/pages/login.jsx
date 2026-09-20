const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await api.post("/auth/login", {
      email: email.trim(),
      password,
    });

    const token = res.data.access_token || res.data.token;

    if (!token) {
      throw new Error("Token not found");
    }

    localStorage.setItem("token", token);
    navigate("/dashboard");
  } catch (err) {
    console.error(err);

    if (err.response?.data?.detail) {
      setError(err.response.data.detail);
    } else {
      setError("Invalid email or password.");
    }
  } finally {
    setLoading(false);
  }
};
