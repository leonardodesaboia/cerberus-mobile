import React, { useState, useEffect, useCallback } from 'react';
import { 
  IonPage, 
  IonContent, 
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonText, 
  IonLabel, 
  IonIcon, 
  IonRefresher,
  IonRefresherContent,
  IonChip,
  IonToast,
  IonItem,
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
  plasticDiscarted?: number;
  metalDiscarted?: number;
  code?: string;
  redeemed?: boolean;
  activityDate: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  img: string;
  isActive: boolean;
  stock?: number;
}

const Extrato: React.FC = () => {
  const [allLogs, setAllLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [productsMap, setProductsMap] = useState<{[key: string]: Product}>({});
  
  // Fetch products data to match product IDs with names
  const fetchProductsData = async () => {
    try {
      const productsData = await fetchProducts();
      console.log("Produtos obtidos:", productsData);
      
      // Create a map of products by ID for easy access
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
  
  // Create a memoized fetchData function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First get the products to map IDs to names
      const products = await fetchProductsData();
      
      // Get user data to show current points
      const userData = await getUserData();
      setUserPoints(userData.points);
      
      // Get transaction logs
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
        // If no logs are found, set empty array and don't treat as error
        setAllLogs([]);
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao carregar histórico de transações');
      }
      
      const logsData = await response.json();
      
      // Enrich logs with product details if needed
      const enrichedLogs = logsData.map((log: Log) => {
        // If the log already has populated product details, use them
        if (typeof log.product === 'object' && log.product !== null) {
          return log;
        }
        
        // If there's a product ID but no product object, try to get product details from the map
        if (typeof log.product === 'string' && log.product) {
          const productId = log.product;
          const productDetails = products[productId];
          
          if (productDetails) {
            return {
              ...log,
              product: productDetails
            };
          }
        }
        
        // Return original log if no enrichment was possible
        return log;
      });
      
      // Sort logs by date (newest first)
      const sortedLogs = enrichedLogs.sort((a: Log, b: Log) => {
        return new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime();
      });
      
      setAllLogs(sortedLogs);
    } catch (err: any) {
      console.error("Erro ao carregar statement:", err);
      setError(`Não foi possível carregar o histórico de transações: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load data when component mounts and subscribe to PointsUpdateEvent
  useEffect(() => {
    console.log("Extrato - Componente montado");
    fetchData();
    
    // Subscribe to PointsUpdateEvent to refresh data when points are updated
    const handlePointsUpdate = () => {
      console.log("Extrato - Atualizando dados após alteração de pontos");
      fetchData();
    };
    
    PointsUpdateEvent.subscribe(handlePointsUpdate);
    
    // Refresh data when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Extrato - Página focada novamente");
        fetchData();
      }
    };
    
    // Listen for route changes using Ionic lifecycle events
    document.addEventListener('ionViewWillEnter', fetchData);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup subscriptions
    return () => {
      PointsUpdateEvent.unsubscribe(handlePointsUpdate);
      document.removeEventListener('ionViewWillEnter', fetchData);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData]);
  
  // Handle pull-to-refresh
  const handleRefresh = (event: CustomEvent) => {
    fetchData().then(() => {
      event.detail.complete();
    });
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    // Try to convert string to Date
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      // If not a valid date, show string as is
      return dateString;
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get description for a transaction
  const getTransactionDescription = (log: Log) => {
    if (log.product) {
      // If product is an object with name property
      if (typeof log.product === 'object' && log.product !== null && log.product.name) {
        return `Resgate: ${log.product.name}`;
      }
      
      // If product is a string (ID), try to get product name from map
      if (typeof log.product === 'string' && productsMap[log.product]) {
        return `Resgate: ${productsMap[log.product].name}`;
      }
      
      // Fallback if we can't find the product name
      return "Resgate de produto";
    } else if (log.plasticDiscarted && log.plasticDiscarted > 0) {
      return `Descarte de ${log.plasticDiscarted} plásticos`;
    } else if (log.metalDiscarted && log.metalDiscarted > 0) {
      return `Descarte de ${log.metalDiscarted} metais`;
    } else if (log.points > 0) {
      return "Entrada de pontos";
    } else {
      return "Saída de pontos";
    }
  };
  
  // Render empty state when there are no transactions
  const renderEmptyState = () => (
    <div className="empty-statement-state">
      <IonIcon icon={timeOutline} className="empty-icon" />
      <h3>Nenhuma transação encontrada</h3>
      <p>Você ainda não tem movimentações de pontos em sua conta.</p>
    </div>
  );
  
  // Get product name from log
  const getProductName = (log: Log) => {
    if (!log.product) return null;
    
    if (typeof log.product === 'object' && log.product.name) {
      return log.product.name;
    }
    
    if (typeof log.product === 'string' && productsMap[log.product]) {
      return productsMap[log.product].name;
    }
    
    return "Produto desconhecido";
  };
  
  // Check if log is for a product redemption
  const isProductRedemption = (log: Log) => {
    return log.product !== undefined && log.product !== null;
  };
  
  // Get redemption status
  const getRedemptionStatus = (log: Log) => {
    return log.redeemed === true;
  };
  
  return (
    <IonPage>
      <IonContent fullscreen className="content-statement">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        
        <Header />
        
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
              
              <IonList>
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
                        
                        {log.code && (
                          <div className="transaction-code">
                            <IonIcon icon={receiptOutline} />
                            <span>Código: {log.code}</span>
                          </div>
                        )}
                        
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
        
        {/* Toast for success/error messages */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          color="success"
        />
      </IonContent>
      <Toolbar />
    </IonPage>
  );
};

export default Extrato;