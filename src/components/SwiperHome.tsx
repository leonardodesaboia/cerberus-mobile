import React, { useState, useEffect } from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { getUserData } from '../services/api';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import '../styles/Home.css';

interface UserData {
  plasticDiscarted: number;
  metalDiscarted: number;
}

interface Achievement {
  id: number;
  name: string;
  threshold: number;
  type: 'plastic' | 'metal';
}

interface UserRecycling {
  plastic: number;
  metal: number;
}

interface SwiperComponentProps {
  showUnlocked: boolean;
}

const SwiperComponent: React.FC<SwiperComponentProps> = ({ showUnlocked }) => {
  const [userRecycling, setUserRecycling] = useState<UserRecycling>({
    plastic: 0,
    metal: 0
  });
  const [error, setError] = useState<string | null>(null);

  const achievements: Achievement[] = [
    { id: 1, name: "25 Plásticos Reciclados", threshold: 25, type: "plastic" },
    { id: 2, name: "50 Plásticos Reciclados", threshold: 50, type: "plastic" },
    { id: 3, name: "100 Plásticos Reciclados", threshold: 100, type: "plastic" },
    { id: 4, name: "25 Metais Reciclados", threshold: 25, type: "metal" },
    { id: 5, name: "50 Metais Reciclados", threshold: 50, type: "metal" },
    { id: 6, name: "100 Metais Reciclados", threshold: 100, type: "metal" }
  ];

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const userData: UserData = await getUserData();
        setUserRecycling({
          plastic: userData.plasticDiscarted || 0,
          metal: userData.metalDiscarted || 0
        });
      } catch (error) {
        setError('Erro ao carregar dados de reciclagem');
        console.error("Erro ao obter dados do usuário", error);
      }
    };

    fetchData();
  }, []);

  const getAchievementStatus = (achievement: Achievement) => {
    const currentValue = achievement.type === 'plastic' 
      ? userRecycling.plastic 
      : userRecycling.metal;

    if (currentValue === 0) return 'locked';
    if (currentValue >= achievement.threshold) {
      if (achievement.threshold >= 100) return 'gold';
      if (achievement.threshold >= 50) return 'silver';
      return 'bronze';
    }
    return 'in-progress';
  };

  const getProgress = (achievement: Achievement) => {
    const currentValue = achievement.type === 'plastic' 
      ? userRecycling.plastic 
      : userRecycling.metal;
    return Math.min((currentValue / achievement.threshold) * 100, 100);
  };

  const getVisibleAchievements = () => {
    return achievements.filter(achievement => {
      const status = getAchievementStatus(achievement);
      const isUnlocked = ['bronze', 'silver', 'gold'].includes(status);
      return showUnlocked ? isUnlocked : !isUnlocked;
    });
  };

  const visibleAchievements = getVisibleAchievements();

  if (visibleAchievements.length === 0) {
    return (
      <div className="empty-achievements">
        <p>{showUnlocked ? 
          "Nenhuma conquista desbloqueada ainda!" : 
          "Nenhuma conquista em progresso!"}</p>
      </div>
    );
  }

  return (
    <div className="achievements-container">
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
        {visibleAchievements.map((achievement) => {
          const status = getAchievementStatus(achievement);
          const isCompleted = ['bronze', 'silver', 'gold'].includes(status);

          return (
            <SwiperSlide key={achievement.id}>
              <IonCard className={`custom-card achievement-${status}`}>
                <span className={`material-symbols-outlined trophy-icon ${status}`}>
                  trophy
                </span>
                <IonCardHeader>
                  <IonCardTitle>{achievement.name}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {!isCompleted && (
                    <div className="progress-container">
                      <div 
                        className="progress-bar"
                        style={{ width: `${getProgress(achievement)}%` }}
                      />
                      <span className="progress-text">
                        {achievement.type === 'plastic' 
                          ? userRecycling.plastic 
                          : userRecycling.metal}
                        /{achievement.threshold}
                      </span>
                    </div>
                  )}
                  <p className={`achievement-status ${status}`}>
                    {isCompleted ? 'Conquista Desbloqueada!' : 'Em progresso...'}
                  </p>
                </IonCardContent>
              </IonCard>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default SwiperComponent;