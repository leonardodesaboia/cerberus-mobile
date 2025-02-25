import React, { useState, useEffect } from 'react';
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

interface Log {
  _id: string;
  user: string;
  points: number;
  product: string;  // ID do produto
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
}

// Interface para o log enriquecido com detalhes do produto
interface EnrichedLog extends Log {
  productDetails?: Product;
}

const Redeem: React.FC = () => {
  // Estado para os logs pendentes e concluídos
  const [pendingLogs, setPendingLogs] = useState<EnrichedLog[]>([]);
  const [redeemedLogs, setRedeemedLogs] = useState<EnrichedLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<EnrichedLog | null>(null);
  const [showDetailsAlert, setShowDetailsAlert] = useState<boolean>(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [productsMap, setProductsMap] = useState<{[key: string]: Product}>({});

  // Buscar produtos para mapear com os logs
  const fetchProductsData = async () => {
    try {
      const productsData = await fetchProducts();
      console.log("Produtos obtidos:", productsData);
      
      // Criar um mapa de produtos por ID para facilitar o acesso
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

  // Enriquecer logs com detalhes dos produtos
  const enrichLogs = (logs: Log[], productsMap: {[key: string]: Product}): EnrichedLog[] => {
    return logs.map(log => ({
      ...log,
      productDetails: productsMap[log.product]
    }));
  };

  // Buscar logs de resgate e enriquecê-los com detalhes dos produtos
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Primeiro buscar os produtos para ter os detalhes disponíveis
      console.log("Buscando produtos...");
      const products = await fetchProductsData();
      
      // Buscar logs pendentes (não resgatados)
      console.log("Buscando logs pendentes...");
      const pending = await getUserPendingLogs();
      console.log("Logs pendentes brutos:", pending);
      
      // Buscar logs já resgatados
      console.log("Buscando logs resgatados...");
      const redeemed = await getUserRedeemedLogs();
      console.log("Logs resgatados brutos:", redeemed);
      
      // Enriquecer logs com detalhes dos produtos
      const enrichedPending = enrichLogs(pending, products);
      const enrichedRedeemed = enrichLogs(redeemed, products);
      
      console.log("Logs pendentes enriquecidos:", enrichedPending);
      console.log("Logs resgatados enriquecidos:", enrichedRedeemed);
      
      setPendingLogs(enrichedPending);
      setRedeemedLogs(enrichedRedeemed);
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err);
      setError(`Não foi possível carregar os produtos resgatados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    console.log("Redeem - Componente montado");
    fetchData();
    
    // Recarregar quando a página ficar visível novamente
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Redeem - Página focada novamente");
        fetchData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Lidar com o pull-to-refresh
  const handleRefresh = (event: CustomEvent) => {
    fetchData().then(() => {
      event.detail.complete();
    });
  };

  // Exibir detalhes do log quando clicar no card
  const handleLogClick = (log: EnrichedLog) => {
    setSelectedLog(log);
    setShowDetailsAlert(true);
  };

  // Mostrar confirmação para marcar como concluído
  const handleMarkAsComplete = () => {
    if (selectedLog) {
      setShowDetailsAlert(false);
      setShowConfirmAlert(true);
    }
  };

  // Marcar log como resgatado
  const confirmCompletion = async () => {
    if (!selectedLog) return;
    
    try {
      setLoading(true);
      
      // Chamar API para marcar como resgatado
      await markLogAsRedeemed(selectedLog._id);
      
      // Atualizar interface localmente
      const updatedPending = pendingLogs.filter(log => log._id !== selectedLog._id);
      setPendingLogs(updatedPending);
      
      // Adicionar aos resgatados
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

  // Formatar data para exibição
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data não disponível";
    
    // Tentar converter string para Date
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      // Se não é uma data válida, mostrar a string como está
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

  // Renderizar estado vazio quando não há produtos resgatados
  const renderEmptyState = () => (
    <div className="empty-redeemed-state">
      <IonIcon icon={timeOutline} className="empty-icon" />
      <h3>Nenhum produto resgatado</h3>
      <p>Você ainda não resgatou nenhum produto. Visite a loja para trocar seus pontos por produtos incríveis!</p>
      <IonButton routerLink="/store" expand="block">
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
              <IonButton expand="block" onClick={() => fetchData()}>
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
              {/* Seção de logs pendentes */}
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
                          {log.productDetails ? (
                            <>
                              <img src={log.productDetails.img} alt={log.productDetails.name} className="product-image" />
                              <IonCardHeader>
                                <IonCardTitle className="product-name">{log.productDetails.name}</IonCardTitle>
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
                              <IonCardSubtitle className="product-points">
                                {Math.abs(log.points)} pontos • {formatDate(log.activityDate)}
                              </IonCardSubtitle>
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

              {/* Seção de logs já resgatados */}
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
                          {log.productDetails ? (
                            <>
                              <img src={log.productDetails.img} alt={log.productDetails.name} className="product-image" />
                              <IonCardHeader>
                                <IonCardTitle className="product-name">{log.productDetails.name}</IonCardTitle>

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
                              <IonCardSubtitle className="product-points">
                                {Math.abs(log.points)} pontos • {formatDate(log.activityDate)}
                              </IonCardSubtitle>
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

        {/* Alert de detalhes do log */}
        <IonAlert
          isOpen={showDetailsAlert}
          onDidDismiss={() => setShowDetailsAlert(false)}
          header="Detalhes do Resgate"
          message={
            selectedLog
              ? `${selectedLog.productDetails?.name || 'Produto'}\n\n` +
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
            // Botão para marcar como concluído (apenas para logs pendentes)
            ...(selectedLog && !selectedLog.redeemed 
              ? [{ 
                  text: 'Marcar como Concluído', 
                  handler: handleMarkAsComplete
                }] 
              : [])
          ]}
        />

        {/* Alert de confirmação para marcar como concluído */}
        <IonAlert
          isOpen={showConfirmAlert}
          onDidDismiss={() => setShowConfirmAlert(false)}
          header="Confirmar Conclusão"
          message={`Deseja marcar este resgate como concluído?\n\n${selectedLog?.productDetails?.name || 'Produto'}`}
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

        {/* Toast para mensagens de sucesso/erro */}
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