import React, { useState, } from "react";
import axios from 'axios';
import { get, isEmpty } from 'lodash'
import { ForceGraph2D } from 'react-force-graph';

const SearchSearch = () => {
  const [mainPackageName, setMainPackageName] = useState();
  const [mainPackageVersion, setMainPackageVersion] = useState();
  const [mainPackageDescription, setMainPackageDescription] = useState();

  const [query, setQuery] = useState('');
  const [nodes, setNodes] = useState([])
  const [links, setLinks] = useState([])

  async function fetchData(searchQuery) {
    const response = await axios.get('https://registry.npmjs.cf/' + searchQuery).then((response) => response.data);
    const latestVersion = get(response, 'dist-tags.latest')
    const packageName = get(response, 'name')
    // setMainPackageVersion(latestVersion)
    // setMainPackageName(packageName)
    // setMainPackageDescription(get(response,'description'))
    const packageNode = {id: packageName, name: `${packageName}@${latestVersion}`, val: 3}

    const dep = get(response, 'versions', {})[latestVersion]
    const dependencies = dep && dep.dependencies
    if(isEmpty(dependencies)) return

    const dependencyArray = Object.entries(dependencies)
    const dependencyNodes = dependencyArray.map(dependency => (
      setNodes(nodes => [...nodes, {id: dependency[0], name: `${dependency[0]}@${dependency[1]}`}])
    ))
    const dependencyLinks = dependencyArray.map(dependency =>(
      setLinks(links => [...links, {source: packageName, target: dependency[0]}])
    ))

    dependencyArray.map((dependency, i) =>
      setTimeout(() => {
          fetchData(dependency[0])
        }, i * 100)
    )
  }

  return (
    <>
      <input className="search" value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={() => {setNodes([{id: query, name: query, val: 5}]);fetchData(query)}}>Search</button>
       {/*
         <h2>{mainPackageName} {mainPackageVersion}</h2>
         <h4>{mainPackageDescription}</h4>
         */
       //links.map((dep, index) => <div key={index}>Dependency {index}: {JSON.stringify(dep, null, 2)}</div>)
     }

      {!isEmpty(nodes) && <ForceGraph2D
            graphData={{nodes, links}}
            // nodeAutoColorBy="group"
            // nodeCanvasObject={(node, ctx, globalScale) => {
            //   const label = node.name;
            //   const fontSize = 12/globalScale;
            //   ctx.font = `${fontSize}px Sans-Serif`;
            //   const textWidth = ctx.measureText(label).width;
            //   const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding
            //   ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            //   // ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
            //   ctx.textAlign = 'center';
            //   ctx.textBaseline = 'middle';
            //   ctx.fillStyle = node.color;
            //   ctx.fillText(label, node.x, node.y);
            // }}
          />
        }
    </>
  );
}

export default SearchSearch
