// login.js - Lógica de login
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await api.login(username, password);
      
      if (response.success) {
        api.setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        showNotification('Login realizado com sucesso!', 'success');
        
        // Redirecionar para dashboard
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 500);
      }
    } catch (error) {
      errorMessage.textContent = error.message || 'Erro ao fazer login';
      errorMessage.style.display = 'block';
    }
  });
});
