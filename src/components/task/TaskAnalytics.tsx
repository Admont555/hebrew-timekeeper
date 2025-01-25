import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { TasksByDate } from "@/types/task";
import { motion } from "framer-motion";

interface TaskAnalyticsProps {
  tasksByDate: TasksByDate;
}

const TaskAnalytics = ({ tasksByDate }: TaskAnalyticsProps) => {
  const getCompletionData = () => {
    const data = Object.entries(tasksByDate).map(([date, tasks]) => ({
      x: date,
      y: tasks.filter(task => task.completed).length,
      total: tasks.length
    }));

    return [
      {
        id: "completed tasks",
        data: data.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime())
      }
    ];
  };

  const getPriorityData = () => {
    const priorities = { high: 0, normal: 0, low: 0 };
    Object.values(tasksByDate).flat().forEach(task => {
      priorities[task.priority]++;
    });
    
    return Object.entries(priorities).map(([priority, count]) => ({
      priority,
      tasks: count
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-semibold text-right mb-4">ניתוח משימות</h3>
      
      <div className="h-[200px]">
        <ResponsiveLine
          data={getCompletionData()}
          margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
          xScale={{ type: "point" }}
          yScale={{ type: "linear", min: 0, max: "auto" }}
          curve="cardinal"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
          }}
          enablePoints={true}
          pointSize={8}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          enableArea={true}
          areaOpacity={0.15}
          theme={{
            axis: {
              ticks: {
                text: {
                  fill: "#666",
                  fontSize: 12
                }
              }
            },
            grid: {
              line: {
                stroke: "#ddd",
                strokeWidth: 1
              }
            }
          }}
        />
      </div>

      <div className="h-[200px] mt-8">
        <ResponsiveBar
          data={getPriorityData()}
          keys={["tasks"]}
          indexBy="priority"
          margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={{ scheme: "nivo" }}
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          theme={{
            axis: {
              ticks: {
                text: {
                  fill: "#666",
                  fontSize: 12
                }
              }
            },
            grid: {
              line: {
                stroke: "#ddd",
                strokeWidth: 1
              }
            }
          }}
        />
      </div>
    </motion.div>
  );
};

export default TaskAnalytics;