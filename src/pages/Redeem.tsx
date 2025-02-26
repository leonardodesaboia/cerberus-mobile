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
  IonButton, 
  IonIcon, 
  IonAlert,
  IonRefresher,
  IonRefresherContent,
  IonToast,
  IonFab,
  IonFabButton,
  IonBadge
} from '@ionic/react';
import { checkmarkCircle, timeOutline, refreshOutline, receiptOutline } from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import '../styles/Redeem.css';
import Header from '../components/Header';
import Toolbar from '../components/Toolbar';
import { getUserPendingLogs, getUserRedeemedLogs, markLogAsRedeemed, fetchProducts } from '../services/api';
import PointsUpdateEvent from '../utils/pointsUpdateEvent';

// Component interfaces...
interface Log {
  _id: string;
  user: string;
  points: number;
  product: {
    _id: string;
    name: string;
    price: number;
    img: string;
    isActive: boolean;
    stock?: number;
  };  
  code?: string;
  redeemed?: boolean;
  activityDate?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  img: string;
  isActive: boolean;
  stock?: number;
}

const Redeem: React.FC = () => {
  // Estado para os logs pendentes e concluídos
  const [pendingLogs, setPendingLogs] = useState<Log[]>([]);
  const [redeemedLogs, setRedeemedLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [showDetailsAlert, setShowDetailsAlert] = useState<boolean>(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [productsMap, setProductsMap] = useState<{[key: string]: Product}>({});

  // Create a memoized fetchData function to avoid unnecessary re-creations
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First fetch products to have the details available
      console.log("Buscando produtos...");
      const products = await fetchProductsData();
      
      // Fetch pending logs
      console.log("Buscando logs pendentes...");
      const pending = await getUserPendingLogs();
      console.log("Logs pendentes brutos:", pending);
      
      // Fetch redeemed logs
      console.log("Buscando logs resgatados...");
      const redeemed = await getUserRedeemedLogs();
      console.log("Logs resgatados brutos:", redeemed);
      
      // Enrich logs with product details if needed
      const enrichedPending = enrichLogs(pending, products);
      const enrichedRedeemed = enrichLogs(redeemed, products);
      
      setPendingLogs(enrichedPending);
      setRedeemedLogs(enrichedRedeemed);
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err);
      setError(`Não foi possível carregar os produtos resgatados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to enrich logs with product details
  const enrichLogs = (logs: any[], products: {[key: string]: Product}) => {
    return logs.map(log => {
      // If the log already has populated product details, use them
      if (typeof log.product === 'object' && log.product !== null) {
        return log;
      }
      
      // Otherwise, enrich with data from the products map
      const productId = typeof log.product === 'string' ? log.product : '';
      return {
        ...log,
        product: products[productId] || { 
          _id: productId,
          name: 'Produto Indisponível',
          price: Math.abs(log.points),
          img: '',
          isActive: false
        }
      };
    });
  };

  // Fetch products data
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

  // Load data when component mounts and subscribe to PointsUpdateEvent
  useEffect(() => {
    console.log("Redeem - Componente montado");
    fetchData();
    
    // Subscribe to PointsUpdateEvent to refresh data when points are updated
    const handlePointsUpdate = () => {
      console.log("Redeem - Atualizando dados após alteração de pontos");
      fetchData();
    };
    
    PointsUpdateEvent.subscribe(handlePointsUpdate);
    
    // Refresh data when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Redeem - Página focada novamente");
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

  // Show log details when clicking on the card
  const handleLogClick = (log: Log) => {
    setSelectedLog(log);
    setShowDetailsAlert(true);
  };

  // Show confirmation to mark as completed
  const handleMarkAsComplete = () => {
    if (selectedLog) {
      setShowDetailsAlert(false);
      setShowConfirmAlert(true);
    }
  };

  // Mark log as redeemed
  const confirmCompletion = async () => {
    if (!selectedLog) return;
    
    try {
      setLoading(true);
      
      // Call API to mark as redeemed
      await markLogAsRedeemed(selectedLog._id);
      
      // Update interface locally
      const updatedPending = pendingLogs.filter(log => log._id !== selectedLog._id);
      setPendingLogs(updatedPending);
      
      // Add to redeemed logs
      const updatedLog = { ...selectedLog, redeemed: true };
      setRedeemedLogs([...redeemedLogs, updatedLog]);
      
      setToastMessage("Resgate marcado como concluído com sucesso!");
      setShowToast(true);
    } catch (err: any) {
      setError(`Erro ao atualizar status: ${err.message}`);
    } finally {
      setShowConfirmAlert(false);
      setSelectedLog(null);
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data não disponível";
    
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

  // Render empty state when there are no redeemed products
  const renderEmptyState = () => (
    <div className="empty-redeemed-state">
      <IonIcon icon={timeOutline} className="empty-icon" />
      <h3>Nenhum produto resgatado</h3>
      <p>Você ainda não resgatou nenhum produto. Visite a loja para trocar seus pontos por produtos incríveis!</p>
      <IonButton routerLink="/store" expand="block" className='go-to-store'>
        Ir para a loja
      </IonButton>
    </div>
  );

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        
        <Header />
        
        <div className="redeemed-content">
          <IonText className="title-text">
            <h2 className="redeemed-title">Meus produtos: </h2>
          </IonText>

          {error && (
            <div className="error-message">
              {error}
              <IonButton className='retry-button' expand="block" onClick={() => fetchData()}>
                Tentar novamente
              </IonButton>
            </div>
          )}

          {loading ? (
            <div className="loader">
              <div className="spinner"></div>
            </div>
          ) : pendingLogs.length === 0 && redeemedLogs.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {/* Pending logs section */}
              {pendingLogs.length > 0 && (
                <div className="redeemed-section">
                  <IonLabel>
                    <h3 className='redeem-status'>Produtos pendentes: <p color="warning" className='redeem-badge' style={{ backgroundColor: 'var(--ion-color-warning)' }}>{pendingLogs.length}</p></h3>
                  </IonLabel>
                  <Swiper
                    modules={[Pagination]}
                    spaceBetween={10}
                    slidesPerView={2.3}
                    className="products-swiper"
                  >
                    {pendingLogs.map((log) => (
                      <SwiperSlide key={log._id} className='swiper-slide-redeem-store'>
                        <IonCard 
                          className="product-card pending-card"
                          onClick={() => handleLogClick(log)}
                        >
                          <div className="product-status-indicator pending">
                            <IonIcon icon={timeOutline} />
                            <span>Pendente</span>
                          </div>
                          {log.product ? (
                            <>
                              {log.product.img && (
                                <img src={log.product.img} alt={log.product.name} className="product-image" />
                              )}
                              <IonCardHeader>
                                <IonCardTitle className="product-name">{log.product.name}</IonCardTitle>
                                 {log.code && (
                                  <div className="code-badge">
                                    <IonIcon icon={receiptOutline} />
                                    <span>Código: {log.code}</span>
                                  </div>
                                )}
                              </IonCardHeader>
                            </>
                          ) : (
                            <IonCardHeader>
                              <IonCardTitle className="product-name">Produto Indisponível</IonCardTitle>
                              {log.code && (
                                <div className="code-badge">
                                  <IonIcon icon={receiptOutline} />
                                  <span>Código: {log.code}</span>
                                </div>
                              )}
                            </IonCardHeader>
                          )}
                        </IonCard>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}

              {/* Redeemed logs section */}
              {redeemedLogs.length > 0 && (
                <div className="redeemed-section">
                  <IonLabel>
                    <h3 className='redeem-status'>Produtos resgatados: <p color="success" className='redeem-badge' style={{ backgroundColor: 'var(--ion-color-success)' }}>{redeemedLogs.length}</p></h3>
                  </IonLabel>
                  <Swiper
                    modules={[Pagination]}
                    spaceBetween={10}
                    slidesPerView={2.3}
                    className="products-swiper"
                  >
                    {redeemedLogs.map((log) => (
                      <SwiperSlide key={log._id} className='swiper-slide-redeem-store'>
                        <IonCard 
                          className="product-card completed-card"
                          onClick={() => handleLogClick(log)}
                        >
                          <div className="product-status-indicator completed">
                            <IonIcon icon={checkmarkCircle} />
                            <span>Resgatado</span>
                          </div>
                          {log.product ? (
                            <>
                              {log.product.img && (
                                <img src={log.product.img} alt={log.product.name} className="product-image" />
                              )}
                              <IonCardHeader>
                                <IonCardTitle className="product-name">{log.product.name}</IonCardTitle>
                                {log.code && (
                                  <div className="code-badge">
                                    <IonIcon icon={receiptOutline} />
                                    <span>Código: {log.code}</span>
                                  </div>
                                )}
                              </IonCardHeader>
                            </>
                          ) : (
                            <IonCardHeader>
                              <IonCardTitle className="product-name">Produto Indisponível</IonCardTitle>
                              {log.code && (
                                <div className="code-badge">
                                  <IonIcon icon={receiptOutline} />
                                  <span>Código: {log.code}</span>
                                </div>
                              )}
                            </IonCardHeader>
                          )}
                        </IonCard>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}
            </>
          )}
        </div>

        {/* Log details alert */}
        <IonAlert
          isOpen={showDetailsAlert}
          onDidDismiss={() => setShowDetailsAlert(false)}
          header="Detalhes do Resgate"
          message={
            selectedLog
              ? `${selectedLog.product ? selectedLog.product.name : 'Produto'}\n\n` +
                `Pontos: ${Math.abs(selectedLog.points)}\n` +
                `Data: ${formatDate(selectedLog.activityDate)}\n` +
                `${selectedLog.code ? `Código: ${selectedLog.code}\n` : ''}` +
                `Status: ${selectedLog.redeemed ? 'Concluído ✓' : 'Em processamento ⌛'}`
              : ''
          }
          buttons={[
            {
              text: 'Fechar',
              role: 'cancel'
            },
            // Button to mark as completed (only for pending logs)
            ...(selectedLog && !selectedLog.redeemed 
              ? [{ 
                  text: 'Marcar como Concluído', 
                  handler: handleMarkAsComplete
                }] 
              : [])
          ]}
        />

        {/* Confirmation alert to mark as completed */}
        <IonAlert
          isOpen={showConfirmAlert}
          onDidDismiss={() => setShowConfirmAlert(false)}
          header="Confirmar Conclusão"
          message={`Deseja marcar este resgate como concluído?\n\n${selectedLog?.product?.name || 'Produto'}`}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Confirmar',
              handler: confirmCompletion
            }
          ]}
        />

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

export default Redeem;