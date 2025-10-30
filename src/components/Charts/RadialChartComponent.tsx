import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface RadialChartComponentProps {
  data: any[];
  title: string;
}

const RadialChartComponent = ({ data, title }: RadialChartComponentProps) => {
  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="10%"
            outerRadius="80%"
            barSize={10}
            data={data}
          >
            <RadialBar
              label={{ position: 'insideStart', fill: '#fff' }}
              background
              dataKey="accuracy"
            />
            <Legend
              iconSize={10}
              layout="vertical"
              verticalAlign="middle"
              align="right"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RadialChartComponent;
