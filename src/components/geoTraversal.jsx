export function geoTraversal(node, searchInput, path = { district: null, region: null }) {
        let results = [];
        if (node.type === 'city') {
            if (node.name.toLowerCase().includes(searchInput.toLowerCase())) {
                return [{
                    district: path.district,
                    region: path.region,
                    city: node 
                }];
            }
            return [];
        }
        if (node.type === 'federal_district') {
            node.children.forEach((region) => {
                const regionResults = geoTraversal(region, searchInput, {district: node, region: null});
                results = [...results, ...regionResults]
            })
            return results;
        }
        if (node.type === 'region') {
            node.children.forEach((city) => {
                const cityResults = geoTraversal(city, searchInput, {district: path.district, region: node});
                results = [...results, ...cityResults]
            })
            return results;
        }
        return [];
    }

export function findCityById(node, id, path = {district : null, region : null}) {
    const nodes = Array.isArray(node) ? node : [node];

    for (const elem of nodes) {
      if (elem.id === id) {
        return {
          node: elem,
          districtId: path.district?.id,
          regionId: path.region?.id,
          district: path.district,
          region: path.region,
          type: node.type
        }
      }
      if (elem.children) {
        const newPath = {
          district: elem.type === 'federal_district' ? elem : path.district,
          region: elem.type === 'region' ? elem : path.region
        }
        const found = findCityById(elem.children, id, newPath)

        if (found) {
          return found;
        }
      }
    }
    return null;
  }