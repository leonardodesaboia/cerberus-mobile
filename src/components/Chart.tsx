import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "../styles/Chart.css";
import { getUserData } from '../services/api';
import { useEffect, useState } from 'react';

interface ColorMap {
    [key: string]: string;
}

interface ChartData {
    name: string;
    amount: number;
    percentage?: number;
}

interface UserData {
    plasticDiscarted: number;
    metalDiscarted: number;
}

const COLORS: ColorMap = { 
    Plástico: "var(--ion-primary-color)", 
    Metal: "var(--ion-secondary-color)" 
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text 
            x={x} 
            y={y} 
            fill="white" 
            textAnchor="middle" 
            dominantBaseline="central"
            style={{ fontSize: '12px', fontWeight: 'bold' }}
        >
            {`${(percent * 100).toFixed(1)}%`}
        </text>
    );
};

const TrashChart: React.FC = () => {
    const [data, setData] = useState<ChartData[]>([]);
    const [total, setTotal] = useState<number>(0);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                const userData: UserData = await getUserData();
                const totalAmount: number = userData.plasticDiscarted + userData.metalDiscarted;
                
                const filterData: ChartData[] = [
                    { 
                        name: "Plástico", 
                        amount: userData.plasticDiscarted || 0,
                        percentage: totalAmount > 0 ? (userData.plasticDiscarted / totalAmount) * 100 : 0
                    },
                    { 
                        name: "Metal", 
                        amount: userData.metalDiscarted || 0,
                        percentage: totalAmount > 0 ? (userData.metalDiscarted / totalAmount) * 100 : 0
                    }
                ];
                
                setData(filterData);
                setTotal(totalAmount);
            } catch (error) {
                console.error("Erro ao obter dados do usuário", error);
            }
        };
        
        fetchData();
    }, []);

    return (
        <section className="waste-stats-section">
            <h2 className="section-title">Suas estatísticas:</h2>
            <div className="chart-container">
                <ResponsiveContainer height={250}>
                    <PieChart>
                        <Pie 
                            data={data} 
                            dataKey="amount" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={100}
                            labelLine={false}
                            label={renderCustomizedLabel}
                        >
                            {data.map((entry: ChartData) => (
                                <Cell 
                                    key={entry.name} 
                                    fill={COLORS[entry.name]} 
                                />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} Descartados`, '']} />
                    </PieChart>
                </ResponsiveContainer>

                <div className="legend-container">
                    {data.map((entry: ChartData) => {
                        const percentage = total > 0 
                            ? ((entry.amount / total) * 100).toFixed(1) 
                            : '0';
                            
                        return (
                            <div key={entry.name} className="legend-item">
                                <span
                                    className="legend-color"
                                    style={{ backgroundColor: COLORS[entry.name] }}
                                ></span>
                                {entry.name}: {entry.amount} Descartados ({percentage}%)
                            </div>
                        );
                    })}
                    <div className="legend-item total">
                        <strong>Total:</strong> {total} Descartados
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrashChart;