/* eslint-disable prettier/prettier */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Image, Dimensions} from 'react-native';
import axios from 'axios'
import {VictoryChart, VictoryLine, VictoryAxis, VictoryScatter, VictoryTooltip} from "victory-native";
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();



const App =  () =>{
  const [currentChartData, setChart] = useState();
  const [currentIndicator, setIndicator] = useState();
  const [bitcoinGeneral, setGeneral] = useState();
  const [yearData, setYearData] = useState();
  const [monthData, setMonthData] = useState();
  const [weekData, setWeekData] = useState();
  const [dayData, setDayData] = useState();
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  useEffect(() => {
    const fetchData = async () => {
      const general = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true')
      if(general.data){
      setGeneral(general.data);
      setIndicator(general.data.market_data.price_change_percentage_24h);
      }

      const year = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=eur&days=365&interval=daily')
      if(year.data)
      setYearData(year.data.prices.filter(function(value, index, Arr) {
        return index % 30 == 0;
    }));

      const month = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=eur&days=30&interval=daily')
      if(month.data)
      month.data.prices.pop()
      setMonthData(month.data.prices);

      const week = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=eur&days=7')
      if(week.data)
      setWeekData(week.data.prices.filter(function(value, index, Arr) {
        return index % 24 == 0;
    }));

      const day = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=eur&days=1&interval=hourly')
      if(day.data)
      day.data.prices.pop()
      setDayData(day.data.prices);
      setChart(day.data.prices)
    }
    fetchData().catch(error => console.log(error))
  }, [])
  
  const separator = (numb) => {
    var str = numb.toString().split(".");
    str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return str.join(".");
}

  const label = (price) => {
    if(currentChartData === dayData){
      let time = new Date(price[0])
      var hours = time.getHours();
      var minutes = "0" + time.getMinutes();
      return hours + ':' + minutes + '\n€' + separator(price[1].toFixed(0))
    }
    else{
      let date = new Date(price[0]).toLocaleDateString("en-US");
      return date + '\n€' + separator(price[1].toFixed(0))
    }

  }

  return (
    <View style = {styles.container}>

      <View style = {styles.imgCont}>
      <Image style={styles.image} source = {{uri: encodeURI(bitcoinGeneral?.image.large)}}/>
      </View>
      <View style = {styles.general}>
        <View style = {styles.text}>
          <Text style = {styles.symbol}>{bitcoinGeneral?.symbol.toUpperCase()}</Text>
          <Text style = {styles.id}>{bitcoinGeneral?.id.replace(bitcoinGeneral.id[0], (bitcoinGeneral.id[0].toUpperCase()))}</Text>
        </View>

        <View style = {styles.indicators}>
          <Text style = {styles.price}>€{separator(Number(bitcoinGeneral?.market_data.current_price.eur))}</Text>
          <View style = {[styles.percentageContainer, {backgroundColor: currentIndicator <0 ? 'red' : 'green'}]}>
            <Text style = {styles.percentage}>{currentIndicator?.toFixed(2)}%</Text>
          </View>
        </View>  
      </View>

      <View style = {styles.btnContainer}>

        <TouchableOpacity style = {styles.button} onPress = {()=>{setChart(dayData);  setIndicator(bitcoinGeneral?.market_data.price_change_percentage_24h)}}>
          <Text style = {styles.btntext}>24h</Text>
        </TouchableOpacity>

        <TouchableOpacity style = {styles.button} onPress = {()=>{setChart(weekData);  setIndicator(bitcoinGeneral?.market_data.price_change_percentage_7d)}}>
          <Text style = {styles.btntext}>7d</Text>
        </TouchableOpacity>

        <TouchableOpacity style = {styles.button} onPress = {()=>{setChart(monthData);  setIndicator(bitcoinGeneral?.market_data.price_change_percentage_30d)}}>
          <Text style = {styles.btntext}>1m</Text>
        </TouchableOpacity>

        <TouchableOpacity style = {styles.button} onPress = {()=>{setChart(yearData);  setIndicator(bitcoinGeneral?.market_data.price_change_percentage_1y)}}>
          <Text style = {styles.btntext}>1y</Text>
        </TouchableOpacity>

      </View>

        <View style = {styles.chart}>
          <VictoryChart height={0.5 * windowHeight} width = {windowWidth}  padding={{ top: 55, bottom: 40, left: 35, right: 35}} >
          <VictoryLine
            animate
            data = {currentChartData?.map((price) => ({ x: price[0], y: price[1]}))}
            style={{
              data: {
                stroke: "#f89620" , 
                strokeWidth: 2, 
                axis: {stroke: "transparent"}, 
                ticks: {stroke: "transparent"},
                tickLabels: { fill:"transparent"},
              }
            }}
            height={0.4 * windowHeight} 
            width = {windowWidth}
            />
          <VictoryScatter
            labelComponent={<VictoryTooltip flyoutWidth={70}/>}
            style={{ data: { fill: "white" } }}
            size={4}
            data={currentChartData?.map((price) => ({ x: price[0], y: price[1], label: label(price)}))}
            events={[{
              target: "data",
              eventHandlers: {
                onMouseOver: () => {
                  return [
                    {
                      target: "labels",
                      mutation: () => ({ active: true })
                    }
                  ];
                },
                onMouseOut: () => {
                  return [
                    {
                      target: "data",
                      mutation: () => {}
                    }, 
                    {
                      target: "labels",
                      mutation: () => ({ active: false })
                    }
                  ];
                }
              }
            }]}
            height={0.4 * windowHeight} 
            width = {windowWidth}
          />
          <VictoryAxis style={{ 
            axis: {stroke: "transparent"}, 
            ticks: {stroke: "transparent"},
            tickLabels: { fill:"transparent"} 
      }} />
        </VictoryChart>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: '#123'
  },
  btnContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    transform: [{translateY: 640}]
  },
  button:{
    backgroundColor: '#f89620',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderRadius: 20,
    width: 80,
    height: 40,
    margin: 10,
    textAlign: 'center'
  },
  btntext:{
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  symbol:{
    fontSize: 50,
    fontWeight: 'bold',
    color: 'white'
  },
  id:{
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  general:{
    flexDirection: 'row',
    padding: 15
  },
  text:{
    flexDirection: 'column'
  },
  indicators:{
    flexDirection: 'column',
    transform: [{translateX: 90}]
  },
  price:{
    fontSize: 50,
    fontWeight: 'bold',
    color: 'white'
  },
  percentageContainer:{
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderRadius: 20,
    width: 85,
    height: 40,
    textAlign: 'center',
    transform: [{translateX: 100}]
  },
  percentage:{
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  image:{
    width: 150,
    height: 150,
    transform:[{rotate: '-13deg'}],
    margin: 15,
    marginTop: 30
  },
  imgCont:{
    width: '100%',
    alignItems: 'center'
  },
  chart:{
    transform: [{translateY: -30}]
  }
});

export default App;
