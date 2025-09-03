// /login/services/auth-service.ts

export const authService = {
  async login(_email: string, _password: string) {
    return "Login sukses!";
  },

  async logout() {
    // Belum diimplementasi
    return;
  },

  async checkSession() {
    // Belum diimplementasi
    return;
  },
};
