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
  IonRefresherContent
} from '@ionic/react';
import { checkmarkCircle, timeOutline } from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import '../styles/Redeem.css';
import Header from '../components/Header';
import Toolbar from '../components/Toolbar';
import { getUserData, updateUserPoints, fetchProducts } from '../services/api';

interface Product {
  _id: string;
  name: string;
  price: number;
  img: string;
  isActive: boolean;
}

interface RedeemedProduct extends Product {
  redemptionDate?: string;
  status: boolean; // true = completado, false = pendente
}

const Redeem: React.FC = () => {
  const [redeemedProducts, setRedeemedProducts] = useState<RedeemedProduct[]>([]);
  const [pendingProducts, setPendingProducts] = useState<RedeemedProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<RedeemedProduct | null>(null);
  const [showDetailsAlert, setShowDetailsAlert] = useState<boolean>(false);

  // Define a função fetchUserData corretamente (não aninhada dentro do useEffect)
  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log("Redeem - Carregando dados do usuário...");
      const userData = await getUserData();
      console.log("Redeem - Dados do usuário carregados:", 
        userData.redeemed ? `${userData.redeemed.length} produtos resgatados` : "Nenhum produto resgatado");
      console.log("Conteúdo de userData.redeemed:", userData.redeemed); // Log detalhado
      
      // Organizar produtos resgatados
      if (userData.redeemed && Array.isArray(userData.redeemed)) {
        // Sem ordenação por data - apenas separa por status
        const pending = userData.redeemed
          .filter(product => product.redeemed === false)
          .map(product => ({ ...product, status: false }));
        const completed = userData.redeemed
          .filter(product => product.redeemed === true)
          .map(product => ({ ...product, status: true }));

        console.log("Redeem - Produtos pendentes:", pending.length, pending);
        console.log("Redeem - Produtos concluídos:", completed.length, completed);
        
        setPendingProducts(pending);
        setRedeemedProducts(completed);
      } else {
        console.log("Redeem - Nenhum produto resgatado encontrado");
        setPendingProducts([]);
        setRedeemedProducts([]);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do usuário", err);
      setError("Não foi possível carregar seus produtos resgatados. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Use o useEffect para chamar fetchUserData na montagem do componente
  useEffect(() => {
    console.log("Redeem - Componente montado, carregando dados...");
    fetchUserData();
  }, []);

  const handleRefresh = (event: CustomEvent) => {
    fetchUserData().then(() => {
      event.detail.complete();
    });
  };

  const handleProductClick = (product: RedeemedProduct) => {
    setSelectedProduct(product);
    setShowDetailsAlert(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data não disponível";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render empty state message
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

  console.log("Estado atual - pendingProducts:", pendingProducts.length);
  console.log("Estado atual - redeemedProducts:", redeemedProducts.length);

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        
        <Header />
        
        <div className="redeemed-content">
          <IonText className="title-text">
            <h2 className="redeemed-title">Meus Produtos Resgatados</h2>
          </IonText>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loader">
              <div className="spinner"></div>
            </div>
          ) : redeemedProducts.length === 0 && pendingProducts.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {/* Pending products section */}
              {pendingProducts.length > 0 && (
                <div className="redeemed-section">
                  <IonLabel>
                    <h3>Resgates em Processamento</h3>
                  </IonLabel>
                  <Swiper
                    modules={[Pagination]}
                    spaceBetween={10}
                    slidesPerView={2.3}
                    className="products-swiper"
                  >
                    {pendingProducts.map((product) => (
                      <SwiperSlide key={product._id}>
                        <IonCard 
                          className="product-card pending-card"
                          onClick={() => handleProductClick(product)}
                        >
                          <div className="product-status-indicator pending">
                            <IonIcon icon={timeOutline} />
                            <span>Pendente</span>
                          </div>
                          <img src={product.img} alt={product.name} className="product-image" />
                          <IonCardHeader>
                            <IonCardTitle className="product-name">{product.name}</IonCardTitle>
                            <IonCardSubtitle className="product-points">
                              {product.price} pontos • {formatDate(product.redemptionDate)}
                            </IonCardSubtitle>
                          </IonCardHeader>
                        </IonCard>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}

              {/* Completed redeemed products section */}
              {redeemedProducts.length > 0 && (
                <div className="redeemed-section">
                  <IonLabel>
                    <h3>Resgates Concluídos</h3>
                  </IonLabel>
                  <Swiper
                    modules={[Pagination]}
                    spaceBetween={10}
                    slidesPerView={2.3}
                    className="products-swiper"
                  >
                    {redeemedProducts.map((product) => (
                      <SwiperSlide key={product._id}>
                        <IonCard 
                          className="product-card completed-card"
                          onClick={() => handleProductClick(product)}
                        >
                          <div className="product-status-indicator completed">
                            <IonIcon icon={checkmarkCircle} />
                            <span>Concluído</span>
                          </div>
                          <img src={product.img} alt={product.name} className="product-image" />
                          <IonCardHeader>
                            <IonCardTitle className="product-name">{product.name}</IonCardTitle>
                            <IonCardSubtitle className="product-points">
                              {product.price} pontos • {formatDate(product.redemptionDate)}
                            </IonCardSubtitle>
                          </IonCardHeader>
                        </IonCard>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}
            </>
          )}
        </div>

        {/* Product details alert */}
        <IonAlert
          isOpen={showDetailsAlert}
          onDidDismiss={() => setShowDetailsAlert(false)}
          header="Detalhes do Produto"
          message={
            selectedProduct
              ? `<div>
                  <strong>${selectedProduct.name}</strong><br/>
                  <p>Preço: ${selectedProduct.price} pontos</p>
                  <p>Data de resgate: ${formatDate(selectedProduct.redemptionDate)}</p>
                  <p>Status: ${selectedProduct.status ? 'Concluído' : 'Em processamento'}</p>
                </div>`
              : ''
          }
          buttons={[
            {
              text: 'Fechar',
              role: 'cancel'
            }
          ]}
        />
      </IonContent>
      <Toolbar />
    </IonPage>
  );
};

export default Redeem;