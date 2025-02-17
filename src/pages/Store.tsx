import { 
  IonPage, 
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonText,
  IonLabel,
  IonImg,
} from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import '../styles/Store.css';
import Toolbar from '../components/Toolbar';

const Store: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader className="store-header" collapse="condense">
          <IonToolbar className="custom-toolbar">
            <IonTitle size="large" className="custom-title">Bem vindo, João!</IonTitle>
            <div className="points-display">
              <IonLabel>Seu saldo de pontos</IonLabel>
              <IonText>
                <h2>98</h2>
              </IonText>
            </div>
          </IonToolbar>
        </IonHeader>

        <div className="store-content">
          <IonText className="title-text">
            <h2 className="products-title">Troque seus pontos por produtos</h2>
          </IonText>

          {/* Seções de produtos */}
          {[
            { title: 'Até 20 pontos', icon: '/image.png', alt: 'Caneca' },
            { title: 'Até 40 pontos', icon: '/pen-blue.png', alt: 'Caneta azul' },
            { title: 'Até 80 pontos', icon: '/pen-blue.png', alt: 'Caneta azul premium' },
            { title: 'Até 100 pontos', icon: '/pen-black.png', alt: 'Caneta preta premium' }
          ].map((section, index) => (
            <div className="points-section" key={index}>
              <IonLabel>
                <h3>{section.title}</h3>
              </IonLabel>
              <Swiper
                modules={[Pagination]}
                spaceBetween={10}
                slidesPerView={4}
                className="products-swiper"
              >
                {[1, 2, 3, 4,5,6].map((item) => (
                  <SwiperSlide key={item}>
                    <IonCard className="product-card">
                      <IonImg 
                        src={section.icon}
                        alt={section.alt}
                        className="product-image"
                      />
                    </IonCard>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ))}
        </div>
      </IonContent>
      <Toolbar />
    </IonPage>
  );
};

export default Store;