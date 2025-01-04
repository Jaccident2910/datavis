const reduceData = (theData, maxSize, winnerBool) => {
    let newData = {}
    let size = 0
    let unsortedData = Object.entries(theData)
    let sortedData = []
    
    if (winnerBool) {
    const getSortVal = (item) => {
        const [key, value] = item
        return(value.outGraphFollows)
    }

    sortedData = unsortedData.sort((a,b) => getSortVal(b) - getSortVal(a) )
    console.log("Sorted Data: ")
    console.log(sortedData)
    }
    else {
        sortedData = unsortedData
    }

    for( const item in sortedData ) {
        //console.log(item)
        const [key, value] = sortedData[item]
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

const reduceFollows = (followsData, newData, dataName) => {
    console.log("Checking data at start")
    console.log(dataName)
    console.log(followsData)
    console.log(Object.keys(followsData).length)
    console.log(newData)
    const linkTest = (item) => {
        return(item in newData)
    }

    const notLinkTest = (item) => {
        return(!(item in newData))
    }

    for( const [key, value] of Object.entries(followsData) ) {
        let outOfGraph = value.inGraphFollows.filter(notLinkTest)
        value.outGraphFollows += outOfGraph.length
        
        value.inGraphFollows = value.inGraphFollows.filter(linkTest)
        followsData[key] = value
        followsData[key].inGraphFollowsNum = value.inGraphFollows.length
    }

    for (const [key, value] of Object.entries(newData)) {
        if (!(key in followsData)) {
            followsData[key] = {
                inGraphFollows: [],
                outGraphFollows: 0,
                inGraphFollowsNum: 0,
            }
        }

    }


    return(followsData)

    
}

export const loadAndProcessData = (maxSize=500, winnerBool = true) =>
    
    Promise
      .all([
        d3.json('./data/winners.json'), 
        d3.json('./data/earlybirds.json'),
        d3.json('./data/earlybirds_following.json'),
        d3.json('./data/winners_following.json')
      ])
      .then(([winnerData, earlybirdData, earlybirdFollows, winnerFollows]) => {
        console.log(winnerFollows)
        console.log(Object.keys(winnerFollows).length)
        if(maxSize > 500) { maxSize = 500 }
        if (winnerBool) {
        winnerData = reduceData(winnerData, maxSize, winnerBool)
        let winnerNodes = []
        let winnerLinks = []
        for( const [key, value] of Object.entries(winnerData) ) {
            let newNodeObj = {"id": key, "outGraphFollows": value.outGraphFollows, "totalLikes": value.totalLikes, "inGraphFollowsNum": value.inGraphFollows.length}
            winnerNodes.push(newNodeObj)
            for (const target of value.inGraphFollows) {
                let newLinkObj = {"source": key, "target": target.toString(), "value": 5} // could do some fun stuff with value.
                winnerLinks.push(newLinkObj)
            }
        }
        return ({"winnerNodes": winnerNodes, "winnerLinks": winnerLinks, 
            "winnerFollows": reduceFollows(winnerFollows, winnerData, "winnerFollows"), "earlybirdFollows": reduceFollows(earlybirdFollows, winnerData, "earlybirdFOllows"),
        });

        }
        else {
        //similar processing for earlybirds
        earlybirdData = reduceData(earlybirdData, maxSize, winnerBool)
        let earlyNodes = []
        let earlyLinks = []
        for( const [key, value] of Object.entries(earlybirdData) ) {
            let newNodeObj = {"id": key, "outGraphFollows": value.outGraphFollows, "totalLikes": value.totalLikes, "inGraphFollowsNum": value.inGraphFollows.length}
            earlyNodes.push(newNodeObj)
            for (const target of value.inGraphFollows) {
                let newLinkObj = {"source": key, "target": target.toString(), "value": 5} // could do some fun stuff with value.
                earlyLinks.push(newLinkObj)
            }
        }

        /*
        console.log("winnerNodes:")
        console.log(earlyNodes)
        console.log("winnerLinks:")
        console.log(earlyLinks) */
        
        // Return the combined data
        return ({"winnerNodes": earlyNodes, "winnerLinks": earlyLinks, 
            "winnerFollows": reduceFollows(winnerFollows, earlybirdData, "winnerFollows"), "earlybirdFollows": reduceFollows(earlybirdFollows, earlybirdData, "winnerFollows"),
      // In hindsight I should have just named these loadedNodes and loadedLinks.
        })
        }
      });