import React, { useState, useEffect } from "react";
import axios from 'axios';
import { get, isEmpty } from 'lodash'
import { ForceGraph2D } from 'react-force-graph';

const SearchSearch = () => {
  const [mainPackageName, setMainPackageName] = useState();
  const [mainPackageVersion, setMainPackageVersion] = useState();
  const [mainPackageDescription, setMainPackageDescription] = useState();
  const [data, setData] = useState();
  const [query, setQuery] = useState();

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      const response = await axios.get('https://registry.npmjs.cf/' + query).then((response) => response.data);
      if (!ignore) {
        const latestVersion = get(response, 'dist-tags.latest')
        const packageName = get(response, 'name')
        setMainPackageVersion(latestVersion)
        setMainPackageName(packageName)
        setMainPackageDescription(get(response,'description'))
        const packageNode = {id: packageName, name: packageName, val: 3}

        const dependencies = get(response, 'versions')[latestVersion].dependencies
        if(isEmpty(dependencies)) return
        const dependencyNodes = Object.entries(dependencies).map(dependency => ({id: dependency[0], name: dependency[0]}))
        const dependencyLinks = Object.entries(dependencies).map(dependency =>({source: packageName, target: dependency[0]}))

        dependencyNodes.push(packageNode)
        setData({nodes: dependencyNodes, links: dependencyLinks})
      }
    }

    query && fetchData();
    return () => { ignore = true; }
  }, [query]);

  return (
    <>
      <input className="search" value={query} onChange={e => setQuery(e.target.value)} />
      <h2>{mainPackageName} {mainPackageVersion}</h2>
      <h4>{mainPackageDescription}</h4>

      {!isEmpty(data,'nodes') && <ForceGraph2D
            graphData={data}
            nodeAutoColorBy="group"
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.id;
              const fontSize = 12/globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding
              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              // ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = node.color;
              ctx.fillText(label, node.x, node.y);
            }}
          />
        }
    </>
  );
}

export default SearchSearch
