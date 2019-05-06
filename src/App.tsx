import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './App.css';

type Margin = {
  top: number
  right: number
  bottom: number
  left: number
}

type StyleInfo = {
  width: number
  height: number
  margin: Margin
}

type ChartContainerProps = {
  children: React.ReactNode
  styleInfo: StyleInfo
}

const ChartContainer: React.FC<ChartContainerProps> = ({ children, styleInfo }) => {
  const { width, height, margin } = styleInfo;
  const title = 'Census Age Group and Population by Sex';

  return (
    <svg
      width={width + margin.left + margin.right}
      height={height + margin.top + margin.bottom}
    >
      <rect width='100%' height='100%' fill='none'/>
      <text 
      transform={`translate(${(width + margin.left + margin.right)/2}, 20)`}
      fontWeight={700}
      >
        {title}
      </text>
      {children}
    </svg>
  );
};

type ChartContentProps = {
  children: React.ReactNode
  styleInfo: StyleInfo
}

const ChartContent: React.FC<ChartContentProps> = ({children, styleInfo}) => {
  const { width, height, margin } = styleInfo;

  return (
    <g id='chart' transform={`translate(${margin.left}, ${margin.top})`}>
      <rect width={width} height={height} fill='none' />
      {children}
    </g>
  );
};

type XAxisProps = {
  scaleFunction: any, // TODO: Fix
  styleInfo: StyleInfo
}

const XAxis: React.FC<XAxisProps> = ({ scaleFunction, styleInfo }) => {
  const { width, height, margin } = styleInfo;
  const title = 'Age Group';
  const axisEl = useRef(null);

  useEffect(() => {
    d3.select(axisEl.current).call(scaleFunction);
  }, [scaleFunction]);

  return (
    <>
      <g
        className='axis axis-x'
        transform={`translate(0, ${height})`}
        ref={axisEl}
      />
      <text
        transform={`translate(${(width/2)}, ${(height + margin.top -10 )})`}
        style={{'textAnchor': 'middle'}}
      >
        {title}
      </text>
    </>
  );
}

type YAxisProps = {
  scaleFunction: any, // TODO: Fix
  styleInfo: StyleInfo
}

const YAxis: React.FC<YAxisProps> = ({ scaleFunction, styleInfo }) => {
  const { height, margin } = styleInfo;
  const title = 'Population';
  const axisEl = useRef(null);

  useEffect(() => {
    d3.select(axisEl.current).call(scaleFunction);
  }, [scaleFunction]);

  return (
    <>
      <g
        className='axis axis-y'
        ref={axisEl}
      />
      <text
        transform={'rotate(-90)'}
        y={0 - margin.left}
        x={0 - (height / 2)}
        dy={'1em'}
        style={{'textAnchor': 'middle'}}
      >
        {title}
      </text>
    </>
  );
};

type LegendInfo = {
  color: string
  name: string
  value: number
}

type LegendProps = {
  styleInfo: StyleInfo
  legendInfos: LegendInfo[]
}

const Legend: React.FC<LegendProps> = ({ legendInfos, styleInfo }) => {
  const { width, margin } = styleInfo;

  return (
    <>
    {
      legendInfos.map((info, i) => {
        return (
          <g
            className={'legend'}
            style={{'fontFamily': 'sans-serif'}}
            transform={`translate(0,  ${i * 20})`}
            key={i}
          >
            <rect
              className={'legend-rect'}
              x={width + margin.right - 12}
              y={65}
              width={12}
              height={12}
              fill={info.color}
            ></rect>
            <text
              className={'legend-text'}
              x={ width + margin.right - 22}
              y={70}
              style={{'fontSize': '12px', 'textAnchor': 'end'}}
              dy={'.35em'}
            >
              {info.name}
            </text>
          </g>
        )
      } )
    }
    </>
  )
};

type BarsProps = {
  data: CensusDatum[]
  xScale: d3.ScaleBand<string>
  yScale: d3.ScaleLinear<number, number>
  styleInfo: StyleInfo
  legendInfos: LegendInfo[]
}

const Bars: React.FC<BarsProps> = ({ data, xScale, yScale, styleInfo, legendInfos }) => {
  const { height } = styleInfo;

  return (
    <>
      {
        data.map((d, i) => {
          const info = legendInfos.find(info => info.value === d.sex);
          const fillColor = (info && info.color) || 'black'

          return <rect
            className="bar"
            x={xScale(d.age_group.toString()) || 0}
            y={yScale(d.people)}
            width={xScale.bandwidth()}
            height={height - yScale(d.people)}
            fill={fillColor}
            key={i}
          />
        })
      }
    </>
  );
};

const App: React.FC = () => {
  const styleInfo = {
    width: 600,
    height: 400,
    margin: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 100,
    }
  };
  
  const legendInfos = [
    {
      color: '#42adf4',
      name: 'Male',
      value: 1,
    },
    {
      color: '#ff96ca',
      name: 'Female',
      value: 2,
    }
  ];

  const ageDomain = [...new Set(census.map((row: CensusDatum) => row.age_group.toString()))];
  const peopleDomain = [0, d3.max(census, row => row.people) || 0];

  const xScale = d3.scaleBand()
    .rangeRound([0, styleInfo.width])
    .padding(0.1)
    .domain(ageDomain);

  const yScale = d3.scaleLinear()
    .range([styleInfo.height, 0])
    .domain(peopleDomain);

  const isYearAndSex = (row: CensusDatum, year: number, sex: number) => {
    return row.year === year && row.sex === sex;
  }
  const filteredData = census.filter(row => isYearAndSex(row, 1900, 2));

  return (
    <div style={{'textAlign': 'center'}}>
      <ChartContainer styleInfo={styleInfo}>
        <ChartContent styleInfo={styleInfo}>
          <XAxis scaleFunction={d3.axisBottom(xScale)} styleInfo={styleInfo} />
          <YAxis scaleFunction={d3.axisLeft(yScale)} styleInfo={styleInfo} />
          <Legend legendInfos={legendInfos} styleInfo={styleInfo} />
          <Bars data={filteredData} xScale={xScale} yScale={yScale} styleInfo={styleInfo} legendInfos={legendInfos} />
        </ChartContent>
      </ChartContainer>
    </div>
  )
}

type CensusDatum = {
  year: number,
  age_group: number,
  sex: number,
  people: number
}

const census: CensusDatum[] = [
  {"year":1900,"age_group":0,"sex":1,"people":4619544},
  {"year":1900,"age_group":0,"sex":2,"people":4589196},
  {"year":1900,"age_group":5,"sex":1,"people":4465783},
  {"year":1900,"age_group":5,"sex":2,"people":4390483},
  {"year":1900,"age_group":10,"sex":1,"people":4057669},
  {"year":1900,"age_group":10,"sex":2,"people":4001749},
  {"year":1900,"age_group":15,"sex":1,"people":3774846},
  {"year":1900,"age_group":15,"sex":2,"people":3801743},
  {"year":1900,"age_group":20,"sex":1,"people":3694038},
  {"year":1900,"age_group":20,"sex":2,"people":3751061},
  {"year":1900,"age_group":25,"sex":1,"people":3389280},
  {"year":1900,"age_group":25,"sex":2,"people":3236056},
  {"year":1900,"age_group":30,"sex":1,"people":2918964},
  {"year":1900,"age_group":30,"sex":2,"people":2665174},
  {"year":1900,"age_group":35,"sex":1,"people":2633883},
  {"year":1900,"age_group":35,"sex":2,"people":2347737},
  {"year":1900,"age_group":40,"sex":1,"people":2261070},
  {"year":1900,"age_group":40,"sex":2,"people":2004987},
  {"year":1900,"age_group":45,"sex":1,"people":1868413},
  {"year":1900,"age_group":45,"sex":2,"people":1648025},
  {"year":1900,"age_group":50,"sex":1,"people":1571038},
  {"year":1900,"age_group":50,"sex":2,"people":1411981},
  {"year":1900,"age_group":55,"sex":1,"people":1161908},
  {"year":1900,"age_group":55,"sex":2,"people":1064632},
  {"year":1900,"age_group":60,"sex":1,"people":916571},
  {"year":1900,"age_group":60,"sex":2,"people":887508},
  {"year":1900,"age_group":65,"sex":1,"people":672663},
  {"year":1900,"age_group":65,"sex":2,"people":640212},
  {"year":1900,"age_group":70,"sex":1,"people":454747},
  {"year":1900,"age_group":70,"sex":2,"people":440007},
  {"year":1900,"age_group":75,"sex":1,"people":268211},
  {"year":1900,"age_group":75,"sex":2,"people":265879},
  {"year":1900,"age_group":80,"sex":1,"people":127435},
  {"year":1900,"age_group":80,"sex":2,"people":132449},
  {"year":1900,"age_group":85,"sex":1,"people":44008},
  {"year":1900,"age_group":85,"sex":2,"people":48614},
  {"year":1900,"age_group":90,"sex":1,"people":15164},
  {"year":1900,"age_group":90,"sex":2,"people":20093},
  {"year":1910,"age_group":0,"sex":1,"people":5296823},
  {"year":1910,"age_group":0,"sex":2,"people":5287477},
  {"year":1910,"age_group":5,"sex":1,"people":4991803},
  {"year":1910,"age_group":5,"sex":2,"people":4866139},
  {"year":1910,"age_group":10,"sex":1,"people":4650747},
  {"year":1910,"age_group":10,"sex":2,"people":4471887},
  {"year":1910,"age_group":15,"sex":1,"people":4566154},
  {"year":1910,"age_group":15,"sex":2,"people":4592269},
  {"year":1910,"age_group":20,"sex":1,"people":4637632},
  {"year":1910,"age_group":20,"sex":2,"people":4447683},
  {"year":1910,"age_group":25,"sex":1,"people":4257755},
  {"year":1910,"age_group":25,"sex":2,"people":3946153},
  {"year":1910,"age_group":30,"sex":1,"people":3658125},
  {"year":1910,"age_group":30,"sex":2,"people":3295220},
  {"year":1910,"age_group":35,"sex":1,"people":3427518},
  {"year":1910,"age_group":35,"sex":2,"people":3088990},
  {"year":1910,"age_group":40,"sex":1,"people":2860229},
  {"year":1910,"age_group":40,"sex":2,"people":2471267},
  {"year":1910,"age_group":45,"sex":1,"people":2363801},
  {"year":1910,"age_group":45,"sex":2,"people":2114930},
  {"year":1910,"age_group":50,"sex":1,"people":2126516},
  {"year":1910,"age_group":50,"sex":2,"people":1773592},
  {"year":1910,"age_group":55,"sex":1,"people":1508358},
  {"year":1910,"age_group":55,"sex":2,"people":1317651},
  {"year":1910,"age_group":60,"sex":1,"people":1189421},
  {"year":1910,"age_group":60,"sex":2,"people":1090697},
  {"year":1910,"age_group":65,"sex":1,"people":850159},
  {"year":1910,"age_group":65,"sex":2,"people":813868},
  {"year":1910,"age_group":70,"sex":1,"people":557936},
  {"year":1910,"age_group":70,"sex":2,"people":547623},
  {"year":1910,"age_group":75,"sex":1,"people":322679},
  {"year":1910,"age_group":75,"sex":2,"people":350900},
  {"year":1910,"age_group":80,"sex":1,"people":161715},
  {"year":1910,"age_group":80,"sex":2,"people":174315},
  {"year":1910,"age_group":85,"sex":1,"people":59699},
  {"year":1910,"age_group":85,"sex":2,"people":62725},
  {"year":1910,"age_group":90,"sex":1,"people":23929},
  {"year":1910,"age_group":90,"sex":2,"people":28965},
  {"year":1920,"age_group":0,"sex":1,"people":5934792},
  {"year":1920,"age_group":0,"sex":2,"people":5694244},
  {"year":1920,"age_group":5,"sex":1,"people":5789008},
  {"year":1920,"age_group":5,"sex":2,"people":5693960},
  {"year":1920,"age_group":10,"sex":1,"people":5401156},
  {"year":1920,"age_group":10,"sex":2,"people":5293057},
  {"year":1920,"age_group":15,"sex":1,"people":4724365},
  {"year":1920,"age_group":15,"sex":2,"people":4779936},
  {"year":1920,"age_group":20,"sex":1,"people":4549411},
  {"year":1920,"age_group":20,"sex":2,"people":4742632},
  {"year":1920,"age_group":25,"sex":1,"people":4565066},
  {"year":1920,"age_group":25,"sex":2,"people":4529382},
  {"year":1920,"age_group":30,"sex":1,"people":4110771},
  {"year":1920,"age_group":30,"sex":2,"people":3982426},
  {"year":1920,"age_group":35,"sex":1,"people":4081543},
  {"year":1920,"age_group":35,"sex":2,"people":3713810},
  {"year":1920,"age_group":40,"sex":1,"people":3321923},
  {"year":1920,"age_group":40,"sex":2,"people":3059757},
  {"year":1920,"age_group":45,"sex":1,"people":3143891},
  {"year":1920,"age_group":45,"sex":2,"people":2669089},
  {"year":1920,"age_group":50,"sex":1,"people":2546035},
  {"year":1920,"age_group":50,"sex":2,"people":2200491},
  {"year":1920,"age_group":55,"sex":1,"people":1880975},
  {"year":1920,"age_group":55,"sex":2,"people":1674672},
  {"year":1920,"age_group":60,"sex":1,"people":1587549},
  {"year":1920,"age_group":60,"sex":2,"people":1382877},
  {"year":1920,"age_group":65,"sex":1,"people":1095956},
  {"year":1920,"age_group":65,"sex":2,"people":989901},
  {"year":1920,"age_group":70,"sex":1,"people":714618},
  {"year":1920,"age_group":70,"sex":2,"people":690097},
  {"year":1920,"age_group":75,"sex":1,"people":417292},
  {"year":1920,"age_group":75,"sex":2,"people":439465},
  {"year":1920,"age_group":80,"sex":1,"people":187000},
  {"year":1920,"age_group":80,"sex":2,"people":211110},
  {"year":1920,"age_group":85,"sex":1,"people":75991},
  {"year":1920,"age_group":85,"sex":2,"people":92829},
  {"year":1920,"age_group":90,"sex":1,"people":22398},
  {"year":1920,"age_group":90,"sex":2,"people":32085},
  {"year":1930,"age_group":0,"sex":1,"people":5875250},
  {"year":1930,"age_group":0,"sex":2,"people":5662530},
  {"year":1930,"age_group":5,"sex":1,"people":6542592},
  {"year":1930,"age_group":5,"sex":2,"people":6129561},
  {"year":1930,"age_group":10,"sex":1,"people":6064820},
  {"year":1930,"age_group":10,"sex":2,"people":5986529},
  {"year":1930,"age_group":15,"sex":1,"people":5709452},
  {"year":1930,"age_group":15,"sex":2,"people":5769587},
  {"year":1930,"age_group":20,"sex":1,"people":5305992},
  {"year":1930,"age_group":20,"sex":2,"people":5565382},
  {"year":1930,"age_group":25,"sex":1,"people":4929853},
  {"year":1930,"age_group":25,"sex":2,"people":5050229},
  {"year":1930,"age_group":30,"sex":1,"people":4424408},
  {"year":1930,"age_group":30,"sex":2,"people":4455213},
  {"year":1930,"age_group":35,"sex":1,"people":4576531},
  {"year":1930,"age_group":35,"sex":2,"people":4593776},
  {"year":1930,"age_group":40,"sex":1,"people":4075139},
  {"year":1930,"age_group":40,"sex":2,"people":3754022},
  {"year":1930,"age_group":45,"sex":1,"people":3633152},
  {"year":1930,"age_group":45,"sex":2,"people":3396558},
  {"year":1930,"age_group":50,"sex":1,"people":3128108},
  {"year":1930,"age_group":50,"sex":2,"people":2809191},
  {"year":1930,"age_group":55,"sex":1,"people":2434077},
  {"year":1930,"age_group":55,"sex":2,"people":2298614},
  {"year":1930,"age_group":60,"sex":1,"people":1927564},
  {"year":1930,"age_group":60,"sex":2,"people":1783515},
  {"year":1930,"age_group":65,"sex":1,"people":1397275},
  {"year":1930,"age_group":65,"sex":2,"people":1307312},
  {"year":1930,"age_group":70,"sex":1,"people":919045},
  {"year":1930,"age_group":70,"sex":2,"people":918509},
  {"year":1930,"age_group":75,"sex":1,"people":536375},
  {"year":1930,"age_group":75,"sex":2,"people":522716},
  {"year":1930,"age_group":80,"sex":1,"people":246708},
  {"year":1930,"age_group":80,"sex":2,"people":283579},
  {"year":1930,"age_group":85,"sex":1,"people":88978},
  {"year":1930,"age_group":85,"sex":2,"people":109210},
  {"year":1930,"age_group":90,"sex":1,"people":30338},
  {"year":1930,"age_group":90,"sex":2,"people":43483},
  {"year":1940,"age_group":0,"sex":1,"people":5294628},
  {"year":1940,"age_group":0,"sex":2,"people":5124653},
  {"year":1940,"age_group":5,"sex":1,"people":5468378},
  {"year":1940,"age_group":5,"sex":2,"people":5359099},
  {"year":1940,"age_group":10,"sex":1,"people":5960416},
  {"year":1940,"age_group":10,"sex":2,"people":5868532},
  {"year":1940,"age_group":15,"sex":1,"people":6165109},
  {"year":1940,"age_group":15,"sex":2,"people":6193701},
  {"year":1940,"age_group":20,"sex":1,"people":5682414},
  {"year":1940,"age_group":20,"sex":2,"people":5896002},
  {"year":1940,"age_group":25,"sex":1,"people":5438166},
  {"year":1940,"age_group":25,"sex":2,"people":5664244},
  {"year":1940,"age_group":30,"sex":1,"people":5040048},
  {"year":1940,"age_group":30,"sex":2,"people":5171522},
  {"year":1940,"age_group":35,"sex":1,"people":4724804},
  {"year":1940,"age_group":35,"sex":2,"people":4791809},
  {"year":1940,"age_group":40,"sex":1,"people":4437392},
  {"year":1940,"age_group":40,"sex":2,"people":4394061},
  {"year":1940,"age_group":45,"sex":1,"people":4190187},
  {"year":1940,"age_group":45,"sex":2,"people":4050290},
  {"year":1940,"age_group":50,"sex":1,"people":3785735},
  {"year":1940,"age_group":50,"sex":2,"people":3488396},
  {"year":1940,"age_group":55,"sex":1,"people":2972069},
  {"year":1940,"age_group":55,"sex":2,"people":2810000},
  {"year":1940,"age_group":60,"sex":1,"people":2370232},
  {"year":1940,"age_group":60,"sex":2,"people":2317790},
  {"year":1940,"age_group":65,"sex":1,"people":1897678},
  {"year":1940,"age_group":65,"sex":2,"people":1911117},
  {"year":1940,"age_group":70,"sex":1,"people":1280023},
  {"year":1940,"age_group":70,"sex":2,"people":1287711},
  {"year":1940,"age_group":75,"sex":1,"people":713875},
  {"year":1940,"age_group":75,"sex":2,"people":764915},
  {"year":1940,"age_group":80,"sex":1,"people":359418},
  {"year":1940,"age_group":80,"sex":2,"people":414761},
  {"year":1940,"age_group":85,"sex":1,"people":127303},
  {"year":1940,"age_group":85,"sex":2,"people":152131},
  {"year":1940,"age_group":90,"sex":1,"people":42263},
  {"year":1940,"age_group":90,"sex":2,"people":58119},
  {"year":1950,"age_group":0,"sex":1,"people":8211806},
  {"year":1950,"age_group":0,"sex":2,"people":7862267},
  {"year":1950,"age_group":5,"sex":1,"people":6706601},
  {"year":1950,"age_group":5,"sex":2,"people":6450863},
  {"year":1950,"age_group":10,"sex":1,"people":5629744},
  {"year":1950,"age_group":10,"sex":2,"people":5430835},
  {"year":1950,"age_group":15,"sex":1,"people":5264129},
  {"year":1950,"age_group":15,"sex":2,"people":5288742},
  {"year":1950,"age_group":20,"sex":1,"people":5573308},
  {"year":1950,"age_group":20,"sex":2,"people":5854227},
  {"year":1950,"age_group":25,"sex":1,"people":6007254},
  {"year":1950,"age_group":25,"sex":2,"people":6317332},
  {"year":1950,"age_group":30,"sex":1,"people":5676022},
  {"year":1950,"age_group":30,"sex":2,"people":5895178},
  {"year":1950,"age_group":35,"sex":1,"people":5511364},
  {"year":1950,"age_group":35,"sex":2,"people":5696261},
  {"year":1950,"age_group":40,"sex":1,"people":5076985},
  {"year":1950,"age_group":40,"sex":2,"people":5199224},
  {"year":1950,"age_group":45,"sex":1,"people":4533177},
  {"year":1950,"age_group":45,"sex":2,"people":4595842},
  {"year":1950,"age_group":50,"sex":1,"people":4199164},
  {"year":1950,"age_group":50,"sex":2,"people":4147295},
  {"year":1950,"age_group":55,"sex":1,"people":3667351},
  {"year":1950,"age_group":55,"sex":2,"people":3595158},
  {"year":1950,"age_group":60,"sex":1,"people":3035038},
  {"year":1950,"age_group":60,"sex":2,"people":3009768},
  {"year":1950,"age_group":65,"sex":1,"people":2421234},
  {"year":1950,"age_group":65,"sex":2,"people":2548250},
  {"year":1950,"age_group":70,"sex":1,"people":1627920},
  {"year":1950,"age_group":70,"sex":2,"people":1786831},
  {"year":1950,"age_group":75,"sex":1,"people":1006530},
  {"year":1950,"age_group":75,"sex":2,"people":1148469},
  {"year":1950,"age_group":80,"sex":1,"people":511727},
  {"year":1950,"age_group":80,"sex":2,"people":637717},
  {"year":1950,"age_group":85,"sex":1,"people":182821},
  {"year":1950,"age_group":85,"sex":2,"people":242798},
  {"year":1950,"age_group":90,"sex":1,"people":54836},
  {"year":1950,"age_group":90,"sex":2,"people":90766},
  {"year":1960,"age_group":0,"sex":1,"people":10374975},
  {"year":1960,"age_group":0,"sex":2,"people":10146999},
  {"year":1960,"age_group":5,"sex":1,"people":9495503},
  {"year":1960,"age_group":5,"sex":2,"people":9250741},
  {"year":1960,"age_group":10,"sex":1,"people":8563700},
  {"year":1960,"age_group":10,"sex":2,"people":8310764},
  {"year":1960,"age_group":15,"sex":1,"people":6620902},
  {"year":1960,"age_group":15,"sex":2,"people":6617493},
  {"year":1960,"age_group":20,"sex":1,"people":5268384},
  {"year":1960,"age_group":20,"sex":2,"people":5513495},
  {"year":1960,"age_group":25,"sex":1,"people":5311805},
  {"year":1960,"age_group":25,"sex":2,"people":5548259},
  {"year":1960,"age_group":30,"sex":1,"people":5801342},
  {"year":1960,"age_group":30,"sex":2,"people":6090862},
  {"year":1960,"age_group":35,"sex":1,"people":6063063},
  {"year":1960,"age_group":35,"sex":2,"people":6431337},
  {"year":1960,"age_group":40,"sex":1,"people":5657943},
  {"year":1960,"age_group":40,"sex":2,"people":5940520},
  {"year":1960,"age_group":45,"sex":1,"people":5345658},
  {"year":1960,"age_group":45,"sex":2,"people":5516028},
  {"year":1960,"age_group":50,"sex":1,"people":4763364},
  {"year":1960,"age_group":50,"sex":2,"people":4928844},
  {"year":1960,"age_group":55,"sex":1,"people":4170581},
  {"year":1960,"age_group":55,"sex":2,"people":4402878},
  {"year":1960,"age_group":60,"sex":1,"people":3405293},
  {"year":1960,"age_group":60,"sex":2,"people":3723839},
  {"year":1960,"age_group":65,"sex":1,"people":2859371},
  {"year":1960,"age_group":65,"sex":2,"people":3268699},
  {"year":1960,"age_group":70,"sex":1,"people":2115763},
  {"year":1960,"age_group":70,"sex":2,"people":2516479},
  {"year":1960,"age_group":75,"sex":1,"people":1308913},
  {"year":1960,"age_group":75,"sex":2,"people":1641371},
  {"year":1960,"age_group":80,"sex":1,"people":619923},
  {"year":1960,"age_group":80,"sex":2,"people":856952},
  {"year":1960,"age_group":85,"sex":1,"people":253245},
  {"year":1960,"age_group":85,"sex":2,"people":384572},
  {"year":1960,"age_group":90,"sex":1,"people":75908},
  {"year":1960,"age_group":90,"sex":2,"people":135774},
  {"year":1970,"age_group":0,"sex":1,"people":8685121},
  {"year":1970,"age_group":0,"sex":2,"people":8326887},
  {"year":1970,"age_group":5,"sex":1,"people":10411131},
  {"year":1970,"age_group":5,"sex":2,"people":10003293},
  {"year":1970,"age_group":10,"sex":1,"people":10756403},
  {"year":1970,"age_group":10,"sex":2,"people":10343538},
  {"year":1970,"age_group":15,"sex":1,"people":9605399},
  {"year":1970,"age_group":15,"sex":2,"people":9414284},
  {"year":1970,"age_group":20,"sex":1,"people":7729202},
  {"year":1970,"age_group":20,"sex":2,"people":8341830},
  {"year":1970,"age_group":25,"sex":1,"people":6539301},
  {"year":1970,"age_group":25,"sex":2,"people":6903041},
  {"year":1970,"age_group":30,"sex":1,"people":5519879},
  {"year":1970,"age_group":30,"sex":2,"people":5851441},
  {"year":1970,"age_group":35,"sex":1,"people":5396732},
  {"year":1970,"age_group":35,"sex":2,"people":5708021},
  {"year":1970,"age_group":40,"sex":1,"people":5718538},
  {"year":1970,"age_group":40,"sex":2,"people":6129319},
  {"year":1970,"age_group":45,"sex":1,"people":5794120},
  {"year":1970,"age_group":45,"sex":2,"people":6198742},
  {"year":1970,"age_group":50,"sex":1,"people":5298312},
  {"year":1970,"age_group":50,"sex":2,"people":5783817},
  {"year":1970,"age_group":55,"sex":1,"people":4762911},
  {"year":1970,"age_group":55,"sex":2,"people":5222164},
  {"year":1970,"age_group":60,"sex":1,"people":4037643},
  {"year":1970,"age_group":60,"sex":2,"people":4577251},
  {"year":1970,"age_group":65,"sex":1,"people":3142606},
  {"year":1970,"age_group":65,"sex":2,"people":3894827},
  {"year":1970,"age_group":70,"sex":1,"people":2340826},
  {"year":1970,"age_group":70,"sex":2,"people":3138009},
  {"year":1970,"age_group":75,"sex":1,"people":1599269},
  {"year":1970,"age_group":75,"sex":2,"people":2293376},
  {"year":1970,"age_group":80,"sex":1,"people":886155},
  {"year":1970,"age_group":80,"sex":2,"people":1417553},
  {"year":1970,"age_group":85,"sex":1,"people":371123},
  {"year":1970,"age_group":85,"sex":2,"people":658511},
  {"year":1970,"age_group":90,"sex":1,"people":186502},
  {"year":1970,"age_group":90,"sex":2,"people":314929},
  {"year":1980,"age_group":0,"sex":1,"people":8439366},
  {"year":1980,"age_group":0,"sex":2,"people":8081854},
  {"year":1980,"age_group":5,"sex":1,"people":8680730},
  {"year":1980,"age_group":5,"sex":2,"people":8275881},
  {"year":1980,"age_group":10,"sex":1,"people":9452338},
  {"year":1980,"age_group":10,"sex":2,"people":9048483},
  {"year":1980,"age_group":15,"sex":1,"people":10698856},
  {"year":1980,"age_group":15,"sex":2,"people":10410271},
  {"year":1980,"age_group":20,"sex":1,"people":10486776},
  {"year":1980,"age_group":20,"sex":2,"people":10614947},
  {"year":1980,"age_group":25,"sex":1,"people":9624053},
  {"year":1980,"age_group":25,"sex":2,"people":9827903},
  {"year":1980,"age_group":30,"sex":1,"people":8705835},
  {"year":1980,"age_group":30,"sex":2,"people":8955225},
  {"year":1980,"age_group":35,"sex":1,"people":6852069},
  {"year":1980,"age_group":35,"sex":2,"people":7134239},
  {"year":1980,"age_group":40,"sex":1,"people":5692148},
  {"year":1980,"age_group":40,"sex":2,"people":5953910},
  {"year":1980,"age_group":45,"sex":1,"people":5342469},
  {"year":1980,"age_group":45,"sex":2,"people":5697543},
  {"year":1980,"age_group":50,"sex":1,"people":5603709},
  {"year":1980,"age_group":50,"sex":2,"people":6110117},
  {"year":1980,"age_group":55,"sex":1,"people":5485098},
  {"year":1980,"age_group":55,"sex":2,"people":6160229},
  {"year":1980,"age_group":60,"sex":1,"people":4696140},
  {"year":1980,"age_group":60,"sex":2,"people":5456885},
  {"year":1980,"age_group":65,"sex":1,"people":3893510},
  {"year":1980,"age_group":65,"sex":2,"people":4896947},
  {"year":1980,"age_group":70,"sex":1,"people":2857774},
  {"year":1980,"age_group":70,"sex":2,"people":3963441},
  {"year":1980,"age_group":75,"sex":1,"people":1840438},
  {"year":1980,"age_group":75,"sex":2,"people":2951759},
  {"year":1980,"age_group":80,"sex":1,"people":1012886},
  {"year":1980,"age_group":80,"sex":2,"people":1919292},
  {"year":1980,"age_group":85,"sex":1,"people":472338},
  {"year":1980,"age_group":85,"sex":2,"people":1023115},
  {"year":1980,"age_group":90,"sex":1,"people":204148},
  {"year":1980,"age_group":90,"sex":2,"people":499046},
  {"year":1990,"age_group":0,"sex":1,"people":9307465},
  {"year":1990,"age_group":0,"sex":2,"people":8894007},
  {"year":1990,"age_group":5,"sex":1,"people":9274732},
  {"year":1990,"age_group":5,"sex":2,"people":8799955},
  {"year":1990,"age_group":10,"sex":1,"people":8782542},
  {"year":1990,"age_group":10,"sex":2,"people":8337284},
  {"year":1990,"age_group":15,"sex":1,"people":9020572},
  {"year":1990,"age_group":15,"sex":2,"people":8590991},
  {"year":1990,"age_group":20,"sex":1,"people":9436188},
  {"year":1990,"age_group":20,"sex":2,"people":9152644},
  {"year":1990,"age_group":25,"sex":1,"people":10658027},
  {"year":1990,"age_group":25,"sex":2,"people":10587292},
  {"year":1990,"age_group":30,"sex":1,"people":11028712},
  {"year":1990,"age_group":30,"sex":2,"people":11105750},
  {"year":1990,"age_group":35,"sex":1,"people":9853933},
  {"year":1990,"age_group":35,"sex":2,"people":10038644},
  {"year":1990,"age_group":40,"sex":1,"people":8712632},
  {"year":1990,"age_group":40,"sex":2,"people":8928252},
  {"year":1990,"age_group":45,"sex":1,"people":6848082},
  {"year":1990,"age_group":45,"sex":2,"people":7115129},
  {"year":1990,"age_group":50,"sex":1,"people":5553992},
  {"year":1990,"age_group":50,"sex":2,"people":5899925},
  {"year":1990,"age_group":55,"sex":1,"people":4981670},
  {"year":1990,"age_group":55,"sex":2,"people":5460506},
  {"year":1990,"age_group":60,"sex":1,"people":4953822},
  {"year":1990,"age_group":60,"sex":2,"people":5663205},
  {"year":1990,"age_group":65,"sex":1,"people":4538398},
  {"year":1990,"age_group":65,"sex":2,"people":5594108},
  {"year":1990,"age_group":70,"sex":1,"people":3429420},
  {"year":1990,"age_group":70,"sex":2,"people":4610222},
  {"year":1990,"age_group":75,"sex":1,"people":2344932},
  {"year":1990,"age_group":75,"sex":2,"people":3723980},
  {"year":1990,"age_group":80,"sex":1,"people":1342996},
  {"year":1990,"age_group":80,"sex":2,"people":2545730},
  {"year":1990,"age_group":85,"sex":1,"people":588790},
  {"year":1990,"age_group":85,"sex":2,"people":1419494},
  {"year":1990,"age_group":90,"sex":1,"people":238459},
  {"year":1990,"age_group":90,"sex":2,"people":745146},
  {"year":2000,"age_group":0,"sex":1,"people":9735380},
  {"year":2000,"age_group":0,"sex":2,"people":9310714},
  {"year":2000,"age_group":5,"sex":1,"people":10552146},
  {"year":2000,"age_group":5,"sex":2,"people":10069564},
  {"year":2000,"age_group":10,"sex":1,"people":10563233},
  {"year":2000,"age_group":10,"sex":2,"people":10022524},
  {"year":2000,"age_group":15,"sex":1,"people":10237419},
  {"year":2000,"age_group":15,"sex":2,"people":9692669},
  {"year":2000,"age_group":20,"sex":1,"people":9731315},
  {"year":2000,"age_group":20,"sex":2,"people":9324244},
  {"year":2000,"age_group":25,"sex":1,"people":9659493},
  {"year":2000,"age_group":25,"sex":2,"people":9518507},
  {"year":2000,"age_group":30,"sex":1,"people":10205879},
  {"year":2000,"age_group":30,"sex":2,"people":10119296},
  {"year":2000,"age_group":35,"sex":1,"people":11475182},
  {"year":2000,"age_group":35,"sex":2,"people":11635647},
  {"year":2000,"age_group":40,"sex":1,"people":11320252},
  {"year":2000,"age_group":40,"sex":2,"people":11488578},
  {"year":2000,"age_group":45,"sex":1,"people":9925006},
  {"year":2000,"age_group":45,"sex":2,"people":10261253},
  {"year":2000,"age_group":50,"sex":1,"people":8507934},
  {"year":2000,"age_group":50,"sex":2,"people":8911133},
  {"year":2000,"age_group":55,"sex":1,"people":6459082},
  {"year":2000,"age_group":55,"sex":2,"people":6921268},
  {"year":2000,"age_group":60,"sex":1,"people":5123399},
  {"year":2000,"age_group":60,"sex":2,"people":5668961},
  {"year":2000,"age_group":65,"sex":1,"people":4453623},
  {"year":2000,"age_group":65,"sex":2,"people":4804784},
  {"year":2000,"age_group":70,"sex":1,"people":3792145},
  {"year":2000,"age_group":70,"sex":2,"people":5184855},
  {"year":2000,"age_group":75,"sex":1,"people":2912655},
  {"year":2000,"age_group":75,"sex":2,"people":4355644},
  {"year":2000,"age_group":80,"sex":1,"people":1902638},
  {"year":2000,"age_group":80,"sex":2,"people":3221898},
  {"year":2000,"age_group":85,"sex":1,"people":970357},
  {"year":2000,"age_group":85,"sex":2,"people":1981156},
  {"year":2000,"age_group":90,"sex":1,"people":336303},
  {"year":2000,"age_group":90,"sex":2,"people":1064581}
]

export default App;
