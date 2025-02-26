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
        'Authorization': `${token}`
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
        'Authorization': `${token}`
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
        'Authorization': `${token}`
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
        'Authorization': `${token}`
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
    
    // This is the key change: We only use the /log endpoint which already handles:
    // 1. Updating user points
    // 2. Reducing product stock
    // 3. Generating a redemption code
    // 4. Creating the redemption record with redeemed=false
    const requestData: UpdatePointsRequest = {
      user: userId,
      product: product._id,
      points: (product.price * -1)
    };
    
    console.log("redeemProduct - Enviando solicitação para API:", requestData);
    
    const response = await fetch(`${API_URL}/log`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      },
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao atualizar pontos');
    }
    
    console.log("redeemProduct - Log criado com sucesso");
    
    // Get updated user data after the operation
    const userData = await getUserData();
    console.log("redeemProduct - Dados do usuário atualizados");
    
    return userData;
  } catch (error: any) {
    console.error("redeemProduct - Erro ao resgatar produto:", error);
    throw new Error(error.message || 'Erro ao resgatar produto');
  }
};

export const updateRedemptionStatus = async (productId: string, isRedeemed: boolean): Promise<UserData> => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error('ID do usuário não encontrado');
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('Token não encontrado');
    }
    
    // Get current user data
    const userData = await getUserData();
    
    // Find the redeemed product and update its status
    if (Array.isArray(userData.redeemed)) {
      const updatedRedeemed = userData.redeemed.map(product => {
        if (product._id === productId) {
          return { ...product, redeemed: isRedeemed };
        }
        return product;
      });
      
      // Update user data with the modified redeemed products
      const updatedUserData = await editUserData({ redeemed: updatedRedeemed });
      return updatedUserData;
    } else {
      throw new Error('Lista de produtos resgatados não encontrada');
    }
  } catch (error: any) {
    console.error("updateRedemptionStatus - Erro ao atualizar status do produto:", error);
    throw new Error(error.message || 'Erro ao atualizar status do produto');
  }
};

export const getUserRedemptionLogs = async (): Promise<any[]> => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error('ID do usuário não encontrado');
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('Token não encontrado');
    }
    
    // Usar o endpoint de listagem de logs existente
    const response = await fetch(`${API_URL}/log/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
    });
    
    if (response.status === 400) {
      // Se não houver logs, retornar array vazio
      console.log("Nenhum log encontrado para o usuário");
      return [];
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao obter logs');
    }
    
    const logs = await response.json();
    console.log("Logs obtidos:", logs);
    
    // Filtrar apenas logs que têm um produto (resgate)
    const redemptionLogs = logs.filter((log: any) => log.product);
    
    console.log("Logs de resgate:", redemptionLogs);
    
    return redemptionLogs;
  } catch (error: any) {
    console.error("Erro ao buscar logs de resgate:", error);
    throw new Error(error.message || 'Erro ao buscar logs de resgate');
  }
};

// Funções corrigidas para manipular Logs com URLs corretas (adicionar ao arquivo api.ts)

// Buscar logs de produtos pendentes (não resgatados)
export const getUserPendingLogs = async (): Promise<any[]> => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error('ID do usuário não encontrado');
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('Token não encontrado');
    }
    
    // URL corrigida para logs não resgatados conforme as rotas
    console.log("Buscando logs não resgatados do usuário:", userId);
    const response = await fetch(`${API_URL}/log/not/redeemed/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
    });
    
    if (!response.ok) {
      // Se não houver logs ou ocorrer erro, retornar array vazio
      console.log("Nenhum log pendente encontrado");
      return [];
    }
    
    const logs = await response.json();
    console.log("Logs pendentes obtidos:", logs);
    return logs;
  } catch (error: any) {
    console.error("Erro ao buscar logs pendentes:", error);
    return []; // Retornar array vazio em caso de erro
  }
};

// Buscar logs de produtos já resgatados
export const getUserRedeemedLogs = async (): Promise<any[]> => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error('ID do usuário não encontrado');
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('Token não encontrado');
    }
    
    // URL para logs resgatados conforme as rotas
    console.log("Buscando logs resgatados do usuário:", userId);
    const response = await fetch(`${API_URL}/log/redeemed/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
    });
    
    if (!response.ok) {
      // Se não houver logs ou ocorrer erro, retornar array vazio
      console.log("Nenhum log resgatado encontrado");
      return [];
    }
    
    const logs = await response.json();
    console.log("Logs resgatados obtidos:", logs);
    return logs;
  } catch (error: any) {
    console.error("Erro ao buscar logs resgatados:", error);
    return []; // Retornar array vazio em caso de erro
  }
};

// Função para marcar um log como resgatado
export const markLogAsRedeemed = async (logId: string): Promise<any> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('Token não encontrado');
    }
    
    console.log(`Marcando log ${logId} como resgatado`);
    
    // Usar o método PUT conforme definido nas rotas
    const response = await fetch(`${API_URL}/log/${logId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao atualizar status');
    }
    
    const result = await response.json();
    console.log("Log marcado como resgatado:", result);
    return result;
  } catch (error: any) {
    console.error("Erro ao marcar log como resgatado:", error);
    throw new Error(error.message || 'Erro ao marcar como resgatado');
  }
};