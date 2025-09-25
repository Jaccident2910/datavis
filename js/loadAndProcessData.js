// Dynamic pre-processing of data
// Cuts down the size of the dataset to the number shown in the slider.

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
    }
    else {
        sortedData = unsortedData
    }

    for( const item in sortedData ) {
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

// Cut down the list of who each user follows to match the followers dictionary
const reduceFollows = (followsData, newData, dataName) => {
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
        if(maxSize > 500) { maxSize = 500 }
        if (winnerBool) {
        winnerData = reduceData(winnerData, maxSize, winnerBool)
        // converts the data into the format that the force diagram uses.
        // Nodes holds data about the user, Links holds the link data
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
        
        // Return the combined data
        return ({"winnerNodes": earlyNodes, "winnerLinks": earlyLinks, 
            "winnerFollows": reduceFollows(winnerFollows, earlybirdData, "winnerFollows"), "earlybirdFollows": reduceFollows(earlybirdFollows, earlybirdData, "winnerFollows"),
        // In hindsight I should have just named these loadedNodes and loadedLinks.
        // Oh well.
        })
        }
      });