import { IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonText, 
  IonLabel, IonImg, IonAlert } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { useState } from 'react';
import 'swiper/css';
import 'swiper/css/pagination';
import '../styles/Store.css';
import Toolbar from '../components/Toolbar';
import Header from '../components/Header'

interface ProductInfo {
  id: number;
  name: string;
  points: number;
  image: string;
}

const Store: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);

  const handleProductClick = (product: ProductInfo) => {
    setSelectedProduct(product);
    setShowAlert(true);
  };

  const sections = [
    { 
      title: 'Até 20 pontos', 
      products: [
        { id: 1, name: 'Caneca', points: 20, image: '../../public/image.png' },
        { id: 2, name: 'Caneta básica', points: 15, image: '/image.png' },
        { id: 1, name: 'Caneca', points: 20, image: '../../public/image.png' },
        { id: 2, name: 'Caneta básica', points: 15, image: '/image.png' },
        { id: 1, name: 'Caneca', points: 20, image: '../../public/image.png' },
        { id: 2, name: 'Caneta básica', points: 15, image: '/image.png' },

      ]
    },
    { 
      title: 'Até 40 pontos', 
      products: [
        { id: 3, name: 'Caneta azul', points: 35, image: '/pen-blue.png' },
        { id: 4, name: 'Caderno', points: 40, image: '/pen-blue.png' },

      ]
    },
  ];

  return (
    <IonPage>
      <IonContent fullscreen>
        <Header/>

        <div className="store-content">
          <IonText className="title-text">
            <h2 className="products-title">Troque seus pontos por produtos</h2>
          </IonText>

          {sections.map((section, index) => (
            <div className="points-section" key={index}>
              <IonLabel>
                <h3>{section.title}</h3>
              </IonLabel>
              <Swiper
                modules={[Pagination]}
                spaceBetween={10}
                slidesPerView={4.3}
                className="products-swiper"
              >
                {section.products.map((product) => (
                  <SwiperSlide key={product.id}>
                    <IonCard 
                      className="product-card"
                      onClick={() => handleProductClick(product)}
                    >
                      <IonImg 
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                      />
                      <IonLabel className="product-name">{product.name}</IonLabel>
                      <br/>
                      <IonLabel className="product-points">{product.points} pontos</IonLabel>
                    </IonCard>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ))}
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Confirmar troca"
          message={selectedProduct ? 
            `Deseja trocar ${selectedProduct.points} pontos por ${selectedProduct.name}?` : 
            'Confirmar troca de pontos?'}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                setShowAlert(false);
                setSelectedProduct(null);
              },
            },
            {
              text: 'Confirmar',
              handler: () => {
                // Add your purchase logic here
                console.log('Purchase confirmed for:', selectedProduct);
                // You might want to call an API or update the state
                setShowAlert(false);
                setSelectedProduct(null);
              },
            },
          ]}
        />
      </IonContent>
      <Toolbar />
    </IonPage>
  );
};

export default Store;