const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await api.post("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    localStorage.setItem("token", res.data.access_token);
    navigate("/dashboard", { replace: true });

  } catch (err) {
    console.error(err);
    setError(err.response?.data?.detail || "Invalid email or password");
  } finally {
    setLoading(false);
  }
};
