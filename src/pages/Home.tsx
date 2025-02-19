import { IonContent, IonHeader, IonLabel, IonPage, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import '../styles/Home.css';
import Toolbar from '../components/Toolbar';
import Header from '../components/Header'
import SwiperComponent from '../components/SwiperHome';
import TrashChart from '../components/Chart';

const Home: React.FC = () => {
  return (
        <IonPage>
          <IonContent fullscreen>
          <Header/>
          <IonText className="title-text">
            <h2 className='achievements-title'>Conquistas desbloqueadas</h2>
          </IonText>
        <SwiperComponent />
        <IonText className="title-text">
            <h2 className='achievements-title'>Conquistas bloqueadas</h2>
          </IonText>
          <SwiperComponent />
          <TrashChart />
      </IonContent>
      <Toolbar />
    </IonPage>
  );
};

export default Home;
