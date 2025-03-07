import { IonContent, IonHeader, IonLabel, IonPage, IonText, IonTitle, IonToolbar } from '@ionic/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import '../styles/Home.css';
import Toolbar from '../components/Toolbar';
import Header from '../components/Header'
import SwiperComponent from '../components/SwiperHome';
import TrashChart from '../components/Chart';
import { useEffect, useState } from 'react';
import { getUserData } from '../services/api';

const Home: React.FC = () => {
  const [userPoints, setUserPoints] = useState<number>(0);
  const [shouldRefreshHeader, setShouldRefreshHeader] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserData();
        setUserPoints(userData.points);
      } catch (err) {
        setError('Erro ao carregar dados do usuário');
        console.error('Erro ao carregar dados do usuário:', err);
      }
    };

    fetchUserData();
  }, [shouldRefreshHeader]);

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen>
        <IonText className="title-text-home">
          <h2 className='achievements-title-home'>Conquistas desbloqueadas</h2>
        </IonText>
        <SwiperComponent showUnlocked={true} />
        <IonText className="title-text-home">
          <h2 className='achievements-title-home'>Conquistas bloqueadas</h2>
        </IonText>
        <SwiperComponent showUnlocked={false} />
        <TrashChart />
      </IonContent>
      <Toolbar />
    </IonPage>
  );
};

export default Home;