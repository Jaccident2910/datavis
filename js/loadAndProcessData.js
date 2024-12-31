const reduceData = (theData, maxSize) => {
    let newData = {}
    let size = 0
    for( const [key, value] of Object.entries(theData) ) {
        if(size < maxSize) {
            newData[key] = value
            size++
        }
    }
    // now to cull all extra values
    const linkTest = (item) => {
        return(item in newData)
    }

    const notLinkTest = (item) => {
        return(!(item in newData))
    }

    for( const [key, value] of Object.entries(newData) ) {
        let outOfGraph = value.inGraphFollows.filter(notLinkTest)
        value.outGraphFollows += outOfGraph.length
        value.inGraphFollows = value.inGraphFollows.filter(linkTest)
        newData[key] = value
    }

    return(newData)
}



export const loadAndProcessData = (maxSize=500, winnerBool = true) =>
    
    Promise
      .all([
        d3.json('./data/winners.json'), // at the moment this only gets us the numerically earliest in the list, not the highest.
        d3.json('./data/earlybirds.json')
      ])
      .then(([winnerData, earlybirdData]) => {
        if(maxSize > 500) { maxSize = 500 }
        if (winnerBool) {
        winnerData = reduceData(winnerData, maxSize)
        let winnerNodes = []
        let winnerLinks = []
        for( const [key, value] of Object.entries(winnerData) ) {
            let newNodeObj = {"id": key, "outGraphFollows": value.outGraphFollows, "totalLikes": value.totalLikes}
            winnerNodes.push(newNodeObj)
            for (const target of value.inGraphFollows) {
                let newLinkObj = {"source": key, "target": target.toString(), "value": 5} // could do some fun stuff with value.
                winnerLinks.push(newLinkObj)
            }
        }

        return ({"winnerNodes": winnerNodes, "winnerLinks": winnerLinks});

        }
        else {
        //similar processing for earlybirds
        earlybirdData = reduceData(earlybirdData, maxSize)
        let earlyNodes = []
        let earlyLinks = []
        for( const [key, value] of Object.entries(earlybirdData) ) {
            let newNodeObj = {"id": key, "outGraphFollows": value.outGraphFollows, "totalLikes": value.totalLikes}
            earlyNodes.push(newNodeObj)
            for (const target of value.inGraphFollows) {
                let newLinkObj = {"source": key, "target": target.toString(), "value": 5} // could do some fun stuff with value.
                earlyLinks.push(newLinkObj)
            }
        }

        
        console.log("winnerNodes:")
        console.log(earlyNodes)
        console.log("winnerLinks:")
        console.log(earlyLinks)
        
        // Return the combined data
      return ({"winnerNodes": earlyNodes, "winnerLinks": earlyLinks}); 
      // In hindsight I should have just named these loadedNodes and loadedLinks.

        }
      });