import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectFiles, fetchDirectoryStructure } from '../services/directoryTreeSlice';

import './StorageAnalyzer.css';

// echarts.registerTheme(themeObject.name, themeObject);

function humanFileSize(size) {
  var i = !size ? 0 : Math.floor( Math.log(size) / Math.log(1024) );
  return ( size / Math.pow(1024, i) ).toFixed(1) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
};

const DonutChart = ({data, dataPoint, title}) => {
  const option = {
    legend: {
      orient: 'horizontal',
      x: 'center',
      y: '12%',
      data: data.map(key => key.name)
    },
    title: {
      text: title,
      left: 'center',
      top: 'top'
    },
    tooltip: {
      trigger: "item",  //item
      axisPointer: {
        type: "shadow",
      },
      formatter: (params) => {
        return `
                  <div style='font-size: 1em; min-width: 14em;'>
                    <div style='padding: 0.32em; margin-right: 2px; border-radius: 50%; background: ${params.color}; display: inline-block;'></div>
                    ${params.name} <br/>
                    <div style='display: flex; justify-content: space-between'>
                      <span>Size: <b>${humanFileSize(params.data.size)}</b></span>
                      <span>Count: <b>${params.data.count} files</b></span>
                    </div>
                    <!--<b>${params.percent}%</b>-->
                  </div>
                  `;
      }
    },
    series: [
      {
        name: title,
        type: 'pie',
        itemStyle: {
          borderRadius: 0,
          borderColor: '#f8f6fb',
          borderWidth: 0
        },
        data: data.map(key => {return {...key, value: key[dataPoint]}}),
        radius: ['35%', '60%'],
        center: ['50%', '67%']
      }
    ]
  };

  return (
    <ReactECharts option={option} notMerge={false} lazyUpdate={true}
      onChartReady={null}
      showLoading={data.length === 0}
      onEvents={{'click': (event) => console.log("clicked", event)}}
      className='FileTypeChart'
      width={100}
      height={100}
    />
  );
}

const StorageAnalyzer = () => {

  const files = useSelector(selectFiles);
  const dispatch = useDispatch();
  const [data, setData] = useState([]);

  useEffect(() => {dispatch(fetchDirectoryStructure())}, []);

  useEffect(() => {
    console.log("Fetching finished");

    let filesData = {};
    let mimeTypes = [];

    files.forEach(file => {
      const key = file.mimeType.split('/')[0];

      if (!filesData[key]) {
        filesData[key] = {
          name: key.charAt(0).toUpperCase() + key.substring(1),
          size: 0,
          count: 0
        };
      }

      if (file.size)
        filesData[key].size += parseInt(file.size);
        filesData[key].count += 1;
    })

    for (let key in filesData) {      
        if (filesData.hasOwnProperty(key)) mimeTypes.push(key);
    }

    setData(Object.keys(filesData).map(key => {
      return {
        name: filesData[key].name,
        size: filesData[key].size,
        count: filesData[key].count
      }
    }));
  }, [files]);

  
  return (
    <div className='StorageAnalyzer'>
      <DonutChart data={data} dataPoint='size' title='File Size'/>
      <DonutChart data={data} dataPoint='count' title='Number of files'/>
    </div>
  );
  
}

export default StorageAnalyzer;