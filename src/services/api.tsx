// api.ts
export const API_URL = 'http://localhost:3000';

interface UserRegistrationData {
  email: string;
  cpf: string;
  username: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface UserData {
  id: string;
  _id: string;
  email: string;
  username: string;
  points: number;
  paperDiscarted: number;
  plasticDiscarted: number;
  metalDiscarted: number;
  glassDiscarted: number;
  organicDiscarted: number;
}

interface UpdateUserPointsData {
  points: number;
}

interface ApiError {
  message: string;
}

export const registerUser = async (userData: UserRegistrationData): Promise<UserData> => {
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

export const loginUser = async (userData: LoginData): Promise<{ token: string }> => {
  try {
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
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Erro nas credenciais');
  }
};

export const getUserData = async (): Promise<UserData> => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('ID do usuário não encontrado');
    }

    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao obter os dados do usuário');
    }

    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Erro ao obter os dados do usuário');
  }
};

export const updateUserPoints = async (newPoints: number): Promise<UserData> => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('ID do usuário não encontrado');
    }

    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ points: newPoints }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao atualizar pontos');
    }

    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Erro ao atualizar pontos');
  }
};

export const editUserData = async (updatedData: Partial<UserData>): Promise<UserData> => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('ID do usuário não encontrado');
    }

    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao editar os dados do usuário');
    }

    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Erro ao editar os dados do usuário');
  }
};

interface ProductQueryParams {
  category?: string;
  name?: string;
  price?: number;
  [key: string]: string | number | undefined;
}

export const products = async (params?: ProductQueryParams): Promise<any[]> => {
  try {
    const queryString = params ? new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString() : '';

    const url = `${API_URL}/product${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
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