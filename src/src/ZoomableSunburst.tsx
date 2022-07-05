// Check full tutorial: https://dev.to/andrewchmr/react-d3-sunburst-chart-3cpd
// Adapted from https://observablehq.com/@d3/zoomable-sunburst?collection=@d3/d3-hierarchy

import React from "react";
import * as d3 from "d3";
import data from "./data.json";

const SIZE = 975;
const RADIUS = SIZE / 2;

interface Data {
  name: string;
  value?: number;
}

export const ZoomableSunburst = () => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = React.useState("0,0,0,0");

  const partition = (data: Data) => {
    const root = d3.hierarchy(data)
      //@ts-ignore
      .sum(d => d.value)
      //@ts-ignore
      .sort((a, b) => b.value - a.value);

    return d3.partition()
      .size([2 * Math.PI, root.height + 1])
      (root);
  }

  const getAutoBox = () => {
    if (!svgRef.current) {
      return "";
    }
    const { x, y, width, height } = svgRef.current.getBBox();

    return [x, y, width, height].toString();
  };

  React.useEffect(() => {
    setViewBox(getAutoBox());
  }, []);

  const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

  const format = d3.format(",d");

  const arc = d3
    .arc<d3.HierarchyRectangularNode<Data>>()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(RADIUS * 1.5)
    .innerRadius(d => d.y0 * RADIUS)
    .outerRadius(d => Math.max(d.y0 * RADIUS, d.y1 * RADIUS - 1))

  const root = partition(data);
  //@ts-ignore
  root.each(d => d.current = d);

  const svg = d3.create("svg")
    //@ts-ignore
    .attr("viewBox", [0, 0, width, width])
    .style("font", "10px sans-serif");

  const g = svg.append("g")
    //@ts-ignore
    .attr("transform", `translate(${width / 2},${width / 2})`);

  const path = g.append("g")
    .selectAll("path")
    .data(root.descendants().slice(1))
    .join("path")
    //@ts-ignore
    .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
    //@ts-ignore
    .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
    //@ts-ignore
    .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
    //@ts-ignore
    .attr("d", d => arc(d.current));

  //@ts-ignore
  // path.filter(d => d.children)
  //   .style("cursor", "pointer")
  //   .on("click", clicked);

  path.append("title")
    //@ts-ignore
    .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

  const label = g.append("g")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .style("user-select", "none")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .join("text")
    .attr("dy", "0.35em")
    //@ts-ignore
    .attr("fill-opacity", d => +labelVisible(d.current))
    //@ts-ignore
    .attr("transform", d => labelTransform(d.current))
    //@ts-ignore
    .text(d => d.data.name);

  const parent = g.append("circle")
    .datum(root)
    .attr("r", RADIUS)
    .attr("fill", "none")
    .attr("pointer-events", "all");
  //   .on("click", clicked);

  // function clicked(event, p) {

  //   parent.datum(p.parent || root);

  //   // root.each(d => d.target = {
  //   //   x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
  //   //   x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
  //   //   y0: Math.max(0, d.y0 - p.depth),
  //   //   y1: Math.max(0, d.y1 - p.depth)
  //   // });

  //   const t = g.transition().duration(750);

  //   // Transition the data on all arcs, even the ones that aren’t visible,
  //   // so that if this transition is interrupted, entering arcs will start
  //   // the next transition from the desired position.
  //   // path.transition(t)
  //   //     .tween("data", d => {
  //   //       const i = d3.interpolate(d.current, d.target);
  //   //       return t => d.current = i(t);
  //   //     })
  //   //   .filter(function(d: d3.HierarchyRectangularNode<Data>) {
  //   //     return +this.getAttribute("fill-opacity") || arcVisible(d.target);
  //   //   })
  //   //     .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
  //   //     .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none") 

  //   //     .attrTween("d", d => () => arc(d.current));

  //   // label.filter((d) => {
  //   //     return +this.getAttribute("fill-opacity") || labelVisible(d.target);
  //   //   }).transition(t)
  //   //     .attr("fill-opacity", d => +labelVisible(d.target))
  //   //     .attrTween("transform", d => () => labelTransform(d.current));
  // }

  function arcVisible(d: d3.HierarchyRectangularNode<Data>) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d: d3.HierarchyRectangularNode<Data>) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d: d3.HierarchyRectangularNode<Data>) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * RADIUS;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }

  //return svg.node();

  return (
    <svg width={SIZE} height={SIZE} viewBox={viewBox} ref={svgRef}>
      <g fillOpacity={0.6}>
        {root
          .descendants()
          .filter((d) => d.depth)
          .map((d, i) => (
            //@ts-ignore
            <path key={`${d.data.name}-${i}`} fill={getColor(d)} d={arc(d)}>
              <text>
                {d
                  .ancestors()
                  //@ts-ignore
                  .map((d) => d.data.name)
                  .reverse()
                  .join("/")}
                \n${format(
                  //@ts-ignore
                  d.value
                )}
              </text>
            </path>
          ))}
      </g>
      <g
        pointerEvents="none"
        textAnchor="middle"
        fontSize={10}
        fontFamily="sans-serif"
      >
        {root
          .descendants()
          .filter((d) => d.depth && ((d.y0 + d.y1) / 2) * (d.x1 - d.x0) > 10)
          .map((d, i) => (
            <text
              //@ts-ignore
              key={`${d.data.name}-${i}`}
              //@ts-ignore
              transform={getTextTransform(d)}
              dy="0.35em"
            >
              {
                //@ts-ignore
                d.data.name
              }
            </text>
          ))}
      </g>
    </svg>
  );
};
