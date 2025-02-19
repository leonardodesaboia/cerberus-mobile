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

export const getUserData = async () => {
  try {
    
    const response = await fetch(`${API_URL}/user/67b36bb2f5f5a0d4dea71eb3`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }); 

    const data = await response.json();
    console.log(data)
    console.log(data.paperDiscarted)
    console.log(data.metalDiscarted)
    console.log(data.username)

    
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao obter os dados do usuário');
    }

    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Erro ao obter os dados do usuário');
  }
};

export const updateUserPoints = async (newPoints: any) => {
  const response = await fetch(`http://localhost:3000/user/67b36bb2f5f5a0d4dea71eb3`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points: newPoints }),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar pontos.');
  }
};

export const editUserData = async (updatedData: any) => {
  try {
   
     const response = await fetch(`${API_URL}/user/67b36bb2f5f5a0d4dea71eb3`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
    console.log(JSON.stringify(updatedData))
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao editar os dados do usuário');
    }

    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Erro ao editar os dados do usuário');
  }
};

export const products = async (userData: string | Record<string, string> | URLSearchParams | string[][] | undefined) => {
  try {
    // Convertendo o objeto userData para query string
    const queryString = new URLSearchParams(userData).toString();
    
    const response = await fetch(`${API_URL}/product?`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
      
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao obter produtos');
    }

    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Erro ao obter produtos');
  }
};