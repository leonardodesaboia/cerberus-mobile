// api.ts
export const API_URL = 'http://localhost:3000';

// Interfaces para tipagem
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
  redeemed: RedeemedProduct[];
  _id: string;
  email: string;
  cpf: string;
  username: string;
  password: string;
  points: number;
  metalDiscarted: number;
  plasticDiscarted: number;
  isActive: boolean;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  img: string;
  isActive: boolean;
  stock: number;
}

interface RedeemedProduct extends Product {
  redemptionDate?: string;
  redeemed: boolean;
}

interface UpdatePointsRequest {
  user: string;
  product: string;
  points: number;
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
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao conectar com o servidor');
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
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao fazer login');
  }
};

// Pegar dados do usuário
export const getUserData = async (): Promise<UserData> => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error('ID do usuário não encontrado');
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('Token não encontrado');
    }
    
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
    }); 
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao obter os dados do usuário');
    }
    
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao obter os dados do usuário');
  }
};

// Função para editar os dados do usuário
export const editUserData = async (updatedData: Partial<UserData>): Promise<UserData> => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error('ID do usuário não encontrado');
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('Token não encontrado');
    }
   
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(updatedData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao editar os dados do usuário');
    }
    
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao editar os dados do usuário');
  }
};

// Atualizar pontos do usuário
export const updateUserPoints = async (product: Product): Promise<void> => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error('ID do usuário não encontrado');
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('Token não encontrado');
    }
    
    const requestData: UpdatePointsRequest = {
      user: userId,
      product: product._id,
      points: (product.price * -1)
    };
    
    const response = await fetch(`${API_URL}/log`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao atualizar pontos');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao atualizar pontos');
  }
};

// Função para obter produtos
// Versão melhorada da função fetchProducts em api.ts
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('Token não encontrado');
    }
    
    const response = await fetch(`${API_URL}/product`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // Adicionando o prefixo Bearer
      }
    });
    
    // Se receber 400 com mensagem que não existem produtos, retorne array vazio
    if (response.status === 400) {
      const errorData = await response.json();
      if (errorData.message && errorData.message.includes("Não existem produtos")) {
        console.log("API informa que não existem produtos no banco de dados. Retornando array vazio.");
        return [];
      }
      throw new Error(errorData.message || 'Erro ao obter produtos');
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao obter produtos');
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    // Se for um erro específico sobre não existir produtos, retorne array vazio
    if (error.message && error.message.includes("Não existem produtos")) {
      console.log("Nenhum produto encontrado. Retornando array vazio.");
      return [];
    }
    throw new Error(error.message || 'Erro ao obter produtos');
  }
};

// Função para resgatar um produto
export const redeemProduct = async (product: Product): Promise<UserData> => {
  try {
    console.log("redeemProduct - Iniciando resgate do produto:", product.name);
    
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error('ID do usuário não encontrado');
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('Token não encontrado');
    }
    
    // Primeiro, atualizar os pontos do usuário (subtrair pontos)
    await updateUserPoints(product);
    console.log("redeemProduct - Pontos atualizados com sucesso");
    
    // Depois, obter os dados atuais do usuário
    const userData = await getUserData();
    console.log("redeemProduct - Dados do usuário obtidos:", userData.username);
    
    // Criar o objeto do produto resgatado com status
    const redeemedProduct: RedeemedProduct = {
      _id: product._id,
      name: product.name,
      price: product.price,
      img: product.img,
      isActive: product.isActive,
      stock: product.stock || 0,
      redemptionDate: new Date().toISOString(), // Mantemos a data para referência, mas não ordenamos por ela
      redeemed: false  // Pendente (false) por padrão
    };
    
    // Adicionar o produto à lista de resgatados (criar array se não existir)
    const redeemed = Array.isArray(userData.redeemed) ? [...userData.redeemed] : [];
    redeemed.push(redeemedProduct);
    console.log("redeemProduct - Produto adicionado à lista de resgatados:", redeemedProduct);
    
    // Atualizar os dados do usuário com o novo produto resgatado
    const updatedUserData = await editUserData({ redeemed });
    console.log("redeemProduct - Dados do usuário atualizados com sucesso:", 
      updatedUserData.redeemed?.length || 0, "produtos resgatados");
    
    return updatedUserData;
  } catch (error: any) {
    console.error("redeemProduct - Erro ao resgatar produto:", error);
    throw new Error(error.message || 'Erro ao resgatar produto');
  }
};