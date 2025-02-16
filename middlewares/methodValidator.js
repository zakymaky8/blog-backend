function OnlyPOSTReq(req, res, next) {
    if (!/post/i.test(req.method)) {
        return res.status(405).json({success: false, message: "Only POST request is allowed!"})
    }
    next()
}


function OnlyGETReq(req, res, next) {
    if (!/get/i.test(req.method)) {
        return res.status(405).json({success: false, message: "Only GET request is allowed!"})
    }
    next()
}

function OnlyPUTReq(req, res, next) {
    if (!/put/i.test(req.method)) {
        return res.status(405).json({success: false, message: "Only PUT request is allowed!"})
    }
    next()
}

function OnlyDELETEReq(req, res, next) {
    if (!/delete/i.test(req.method)) {
        return res.status(405).json({success: false, message: "Only DELETE request is allowed!"})
    }
    next()
}


module.exports =  {
    OnlyDELETEReq,
    OnlyGETReq,
    OnlyPOSTReq,
    OnlyPUTReq
}