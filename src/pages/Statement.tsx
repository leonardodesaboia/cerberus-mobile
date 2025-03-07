import React, { useState, useEffect, useCallback } from 'react';
import { 
  IonPage, 
  IonContent, 
  IonCard,
  IonText, 
  IonLabel, 
  IonIcon, 
  IonRefresher,
  IonRefresherContent,
  IonChip,
  IonList
} from '@ionic/react';
import { 
  arrowUpOutline, 
  arrowDownOutline, 
  receiptOutline, 
  timeOutline 
} from 'ionicons/icons';
import '../styles/Statement.css';
import Header from '../components/Header';
import Toolbar from '../components/Toolbar';
import { getUserData, fetchProducts } from '../services/api';
import PointsUpdateEvent from '../utils/pointsUpdateEvent';

interface Log {
  _id: string;
  user: string;
  points: number;
  product?: string | {
    _id: string;
    name: string;
    price: number;
    img: string;
    isActive: boolean;
  };
  plasticDiscarded?: number;
  metalDiscarded?: number;
  code?: string;
  redeemed?: boolean;
  activityDate: string;
  timestamp?: number; // Campo adicional para ordenação
}

interface Product {
  _id: string;
  name: string;
  price: number;
  img: string;
  isActive: boolean;
  stock?: number;
}

interface EnrichedLog extends Log {
  timestamp: number;
}

const Statement: React.FC = () => {
  const [allLogs, setAllLogs] = useState<EnrichedLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [productsMap, setProductsMap] = useState<{[key: string]: Product}>({});
  
  // Função auxiliar melhorada para análise de datas em diversos formatos
  const parseFlexibleDate = (dateString: string): Date => {
    if (!dateString) return new Date(0); // Data padrão para valores vazios
    
    // Tentar analisar como ISO 8601 primeiro (formato padrão)
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
    
    // Se a string contiver '/', assumir formato DD/MM/YYYY (formato brasileiro)
    if (dateString.includes('/')) {
      // Se houver vírgula, separar data e hora
      const parts = dateString.split(', ');
      const datePart = parts[0].split('/');
      
      const day = parseInt(datePart[0]);
      const month = parseInt(datePart[1]) - 1;  // Meses em JS são baseados em 0
      const year = parseInt(datePart[2]);
      
      // Se houver parte de hora
      if (parts.length > 1) {
        const timePart = parts[1].split(':');
        const hour = parseInt(timePart[0]);
        const minute = parseInt(timePart[1]);
        const second = timePart.length > 2 ? parseInt(timePart[2]) : 0;
        
        return new Date(year, month, day, hour, minute, second);
      } else {
        return new Date(year, month, day);
      }
    }
    
    // Tentativa final: dividir a string e verificar partes
    try {
      // Verificar se é um timestamp (número)
      if (!isNaN(Number(dateString))) {
        return new Date(Number(dateString));
      }
      
      // Última tentativa: dividir por hífen ou espaço
      const parts = dateString.split(/[-T ]/);
      if (parts.length >= 3) {
        // Assumir formato YYYY-MM-DD ou similar
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        return new Date(year, month, day);
      }
    } catch (e) {
      console.error("Erro ao analisar data:", dateString, e);
    }
    
    // Retornar data atual se todas as tentativas falharem
    console.warn("Não foi possível analisar a data:", dateString);
    return new Date();
  };
  
  // Buscar dados de produtos para mapear IDs com nomes
  const fetchProductsData = async (): Promise<{[key: string]: Product}> => {
    try {
      const productsData = await fetchProducts();
      console.log("Produtos obtidos:", productsData);
      
      // Criar um mapa de produtos por ID para fácil acesso
      const productsMap: {[key: string]: Product} = {};
      productsData.forEach((product: Product) => {
        productsMap[product._id] = product;
      });
      
      console.log("Mapa de produtos criado:", productsMap);
      setProductsMap(productsMap);
      return productsMap;
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return {};
    }
  };
  
  // Função para buscar dados memorizada
  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Primeiro obter os produtos para mapear IDs aos nomes
      const products = await fetchProductsData();
      
      // Obter dados do usuário para mostrar pontos atuais
      const userData = await getUserData();
      setUserPoints(userData.points);
      
      // Obter logs de transação
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      if (!token || !userId) {
        throw new Error('Credenciais não encontradas. Por favor, faça login novamente.');
      }
      
      const response = await fetch(`http://localhost:3000/log/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });
      
      if (response.status === 400) {
        // Se nenhum log for encontrado, defina matriz vazia e não trate como erro
        setAllLogs([]);
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao carregar histórico de transações');
      }
      
      const logsData: Log[] = await response.json();
      
      // Enriquecer logs com detalhes do produto, se necessário
      const enrichedLogs: EnrichedLog[] = logsData.map((log: Log) => {
        // Criar timestamp para ordenação
        const timestamp = parseFlexibleDate(log.activityDate).getTime();
        
        // Se o log já tiver detalhes do produto preenchidos, use-os
        if (typeof log.product === 'object' && log.product !== null) {
          return {
            ...log,
            timestamp // Adicionar campo de timestamp para facilitar a ordenação
          };
        }
        
        // Se houver um ID de produto, mas nenhum objeto de produto, tente obter detalhes do produto do mapa
        if (typeof log.product === 'string' && log.product) {
          const productId = log.product;
          const productDetails = products[productId];
          
          if (productDetails) {
            return {
              ...log,
              product: productDetails,
              timestamp
            };
          }
        }
        
        // Retornar log original se nenhum enriquecimento for possível
        return {
          ...log,
          timestamp
        };
      });
      
      // Registrar datas brutas para depuração
      console.log("Datas brutas antes da ordenação:", enrichedLogs.map((log) => ({
        id: log._id,
        date: log.activityDate,
        timestamp: log.timestamp
      })));
      
      // Ordenar por timestamp (mais recente primeiro)
      const sortedLogs = [...enrichedLogs].sort((a, b) => b.timestamp - a.timestamp);
      
      // Registrar datas ordenadas para verificação
      console.log("Datas após ordenação:", sortedLogs.map(log => ({
        id: log._id,
        date: log.activityDate,
        timestamp: log.timestamp,
        formattedDate: new Date(log.timestamp).toLocaleString()
      })));
      
      setAllLogs(sortedLogs);
    } catch (err: any) {
      console.error("Erro ao carregar statement:", err);
      setError(`Não foi possível carregar o histórico de transações: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Obter descrição para uma transação
  const getTransactionDescription = (log: Log): string => {
    if (log.product) {
      // Se o produto for um objeto com propriedade de nome
      if (typeof log.product === 'object' && log.product !== null && log.product.name) {
        return `Resgate: ${log.product.name}`;
      }
      
      // Se o produto for uma string (ID), tente obter o nome do produto do mapa
      if (typeof log.product === 'string' && productsMap[log.product]) {
        return `Resgate: ${productsMap[log.product].name}`;
      }
      
      // Fallback se não pudermos encontrar o nome do produto
      return "Resgate de produto";
    } else if (log.plasticDiscarded && log.plasticDiscarded > 0) {
      return `Descarte de ${log.plasticDiscarded} plásticos`;
    } else if (log.metalDiscarded && log.metalDiscarded > 0) {
      return `Descarte de ${log.metalDiscarded} metais`;
    } else if (log.points > 0) {
      return "Entrada de pontos";
    } else {
      return "Saída de pontos";
    }
  };
  
  // Carregar dados quando o componente é montado e assinar PointsUpdateEvent
  useEffect(() => {
    console.log("Extrato - Componente montado");
    fetchData();
    
    // Assinar o PointsUpdateEvent para atualizar dados quando os pontos são atualizados
    const handlePointsUpdate = (): void => {
      console.log("Extrato - Atualizando dados após alteração de pontos");
      fetchData();
    };
    
    PointsUpdateEvent.subscribe(handlePointsUpdate);
    
    // Atualizar dados quando a página ficar visível novamente
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        console.log("Extrato - Página focada novamente");
        fetchData();
      }
    };
    
    // Ouvir alterações de rota usando eventos de ciclo de vida do Ionic
    document.addEventListener('ionViewWillEnter', fetchData);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Limpar assinaturas
    return () => {
      PointsUpdateEvent.unsubscribe(handlePointsUpdate);
      document.removeEventListener('ionViewWillEnter', fetchData);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData]);
  
  // Lidar com atualização por puxar
  const handleRefresh = (event: CustomEvent): void => {
    fetchData().then(() => {
      event.detail.complete();
    });
  };
  
  // Formatar data para exibição
  const formatDate = (dateString: string): string => {
    try {
      // Usar a mesma lógica de análise para consistência
      const timestamp = parseFlexibleDate(dateString).getTime();
      
      if (isNaN(timestamp)) {
        // Se não for uma data válida, mostre a string como está
        return dateString;
      }
      
      const date = new Date(timestamp);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      // Voltar a mostrar a string original
      return dateString;
    }
  };
  
  // Renderizar estado vazio quando não há transações
  const renderEmptyState = (): JSX.Element => (
    <div className="empty-statement-state">
      <IonIcon icon={timeOutline} className="empty-icon" />
      <h3>Nenhuma transação encontrada</h3>
      <p>Você ainda não tem movimentações de pontos em sua conta.</p>
    </div>
  );
  
  // Verificar se o log é para um resgate de produto
  const isProductRedemption = (log: Log): boolean => {
    return log.product !== undefined && log.product !== null;
  };
  
  // Obter status de resgate
  const getRedemptionStatus = (log: Log): boolean => {
    return log.redeemed === true;
  };
  
  return (
    <IonPage>
      <Header />
      <IonContent fullscreen className="content-statement">
        <div className="statement-content">
          <IonText className="title-text">
            <h2 className="statement-title">Extrato de Pontos</h2>
          </IonText>
          
          {error && (
            <div className="error-message">
              {error}
              <button 
                className="retry-button"
                onClick={() => fetchData()}>
                Tentar novamente
              </button>
            </div>
          )}
          
          {loading ? (
            <div className="loader">
              <div className="spinner"></div>
            </div>
          ) : allLogs.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="transactions-list">
              <IonLabel>
                <h3 className="transactions-header">Histórico de Transações</h3>
              </IonLabel>
              
              <IonList className='transaction-list'>
                {allLogs.map((log) => (
                  <IonCard key={log._id} className="transaction-card">
                    <div className="transaction-content">
                      <div className="transaction-icon-container">
                        <div className={`transaction-icon ${log.points > 0 ? 'positive' : 'negative'}`}>
                          <IonIcon icon={log.points > 0 ? arrowUpOutline : arrowDownOutline} />
                        </div>
                      </div>
                      
                      <div className="transaction-details">
                        <div className="transaction-title">
                          {getTransactionDescription(log)}
                        </div>
                        <div className="transaction-date">
                          {formatDate(log.activityDate)}
                        </div>
                        
                        {isProductRedemption(log) && (
                          <IonChip
                            className={`status-chip ${getRedemptionStatus(log) ? 'redeemed' : 'pending'}`}
                            color={getRedemptionStatus(log) ? "success" : "warning"}
                          >
                            {getRedemptionStatus(log) ? "Resgatado" : "Pendente"}
                          </IonChip>
                        )}
                      </div>
                      
                      <div className={`transaction-points ${log.points > 0 ? 'positive' : 'negative'}`}>
                        {log.points > 0 ? '+' : ''}{log.points} pts
                      </div>
                    </div>
                  </IonCard>
                ))}
              </IonList>
            </div>
          )}
        </div>
      </IonContent>
      <Toolbar />
    </IonPage>
  );
};

export default Statement;