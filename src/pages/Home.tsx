import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import '../styles/Home.css';
import Toolbar from '../components/Toolbar';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className='custom-header'>
        <IonToolbar className='custom-toolbar'>
          <IonTitle>Bem vindo, </IonTitle>
          <h3 className='custom-saldo'>Seu saldo de pontos: </h3>
          <h6 className='custom-pontos'>85 pontos</h6>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <Swiper
      modules={[Autoplay, Pagination]}
      spaceBetween={10}
      slidesPerView={1}
      pagination={{ clickable: true }}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      className="custom-swiper"
    >
      <SwiperSlide>
        <IonCard className="custom-card">
          <img 
            alt="Silhouette of mountains" 
            src="https://ionicframework.com/docs/img/demos/card-media.png" 
          />
          <IonCardHeader>
            <IonCardTitle>Card Title</IonCardTitle>
            <IonCardSubtitle>Card Subtitle</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            Here's a small text description for the card content. Nothing more, nothing less.
          </IonCardContent>
        </IonCard>
      </SwiperSlide>
      <SwiperSlide>
        <IonCard className="custom-card">
          <img 
            alt="Silhouette of mountains" 
            src="https://ionicframework.com/docs/img/demos/card-media.png" 
          />
          <IonCardHeader>
            <IonCardTitle>Card Title</IonCardTitle>
            <IonCardSubtitle>Card Subtitle</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            Here's a small text description for the card content. Nothing more, nothing less.
          </IonCardContent>
        </IonCard>
      </SwiperSlide>
      <SwiperSlide>
        <IonCard className="custom-card">
          <img 
            alt="Silhouette of mountains" 
            src="https://ionicframework.com/docs/img/demos/card-media.png" 
          />
          <IonCardHeader>
            <IonCardTitle>Card Title</IonCardTitle>
            <IonCardSubtitle>Card Subtitle</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            Here's a small text description for the card content. Nothing more, nothing less.
          </IonCardContent>
        </IonCard>
      </SwiperSlide>
    </Swiper>
      </IonContent>
      <Toolbar />
    </IonPage>
  );
};

export default Home;
