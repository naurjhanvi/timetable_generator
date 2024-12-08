// Authentication Module
export const auth = {
    validCredentials: {
        userId: 'admin',
        password: '99admin'
    },

    handleLogin(userId, password) {
        return userId === this.validCredentials.userId && 
               password === this.validCredentials.password;
    }
};