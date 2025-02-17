export const API_URL = 'http://localhost:3000'; 

export const registerUser = async (userData: Object) => {
  try {
    const response = await fetch(`${API_URL}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao cadastrar usuário');
    }

    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Erro ao conectar com o servidor');
  }
};

export const loginUser = async (userData: Object) => {
    const response = await fetch(`${API_URL}/user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
    }

    return data;
};