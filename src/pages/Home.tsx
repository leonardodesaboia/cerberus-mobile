import { IonContent, IonHeader, IonIcon, IonLabel, IonPage, IonText, IonTitle, IonToolbar } from '@ionic/react';
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
import PointsUpdateEvent from "../utils/pointsUpdateEvent";

const Home: React.FC = () => {
  const [userPoints, setUserPoints] = useState<number>(0);
  const [shouldRefreshHeader, setShouldRefreshHeader] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
    const [currentPoints, setCurrentPoints] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchUserData = async () => {
        try {
            const userData = await getUserData();
            setUsername(userData.username);
            setCurrentPoints(userData.points);
        } catch (err) {
            setError("Erro ao carregar dados do usuário");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
        
        // Registrar o listener para atualizações de pontos
        PointsUpdateEvent.subscribe(fetchUserData);

        // Cleanup
        return () => {
            PointsUpdateEvent.unsubscribe(fetchUserData);
        };
    }, []);

    const changeWindow = () => {
        window.location.href = '/statement';
    }


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
      <IonContent fullscreen>
                <IonHeader className="store-header" collapse="condense" >
                    <IonToolbar>
                        <IonTitle size="large" className="custom-title">
                            Bem vindo(a) {username}
                        </IonTitle>
                        <div className="points-display">
                            <IonLabel className="custom-saldo">Seu saldo de pontos</IonLabel>
                            <IonText>
                                <h3 className="custom-points">{currentPoints} <IonIcon icon="chevron-forward-outline" style={{fontSize: "20px"}} onClick={changeWindow}/></h3>
                            </IonText>
                        </div>
                    </IonToolbar>
                </IonHeader>
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