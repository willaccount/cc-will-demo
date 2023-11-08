const MsgKeyMapping = {
    uId : {
        name: 'userId',
    },
    sId : {
        name: 'serviceId',
    },
    cId: {
        name: 'commandId',
    },
    cIdt: {
        name: 'gameCommandId'
    },
    wat: {
        name: 'winAmountPS',
    },
    wa: {
        name: 'winAmount',
    },
    wap1: {
        name: 'winAmountP1',
    },
    ja: {
        name: 'winJackpotAmount',
    },
    wJPAmt: {
        name: 'winJackpotAmount',
    },
    jLn: {
        name: 'jackpotPayline',
    },
    bId: {
        name: 'betId',
    },
    nMx: {
        name: 'normalGameMatrix',
    },
    nTf: {
        name: 'normalGameTableFormat',
    },
    nLn: {
        name: 'normalGamePaylines',
    },
    fLn: {
        name: 'freeGamePaylines',
    },
    nWAmt: {
        name:'normalGameWinAmount',
    },
    fRe: {
        name: 'freeGameRemain',
    },
    fta: {
        name: 'freeGameTotal',
    },
    fMx: {
        name: 'freeGameMatrix',
    },
    fTf: {
        name: 'freeGameTableFormat',
    },
    fa: {
        name: 'freeGameWinAmount',
    },
    bRe: {
        name: 'bonusGameRemain',
    },
    bTa: {
        name: 'bonusGameTotal',
    },
    bpRe: {
        name: 'bonusPlayRemain',
    },
    ba: {
        name: 'bonusGameWinAmount',
    },
    bMx: {
        name: 'bonusGameMatrix',
    },
    bTf: {
        name: 'bonusGameTableFormat',
    },
    bv: {
        name: 'bonusValue',
    },
    v: {
        name: 'version',
    },
    le: {
        name: 'lastEvent',
    },
    mtx: {
        name: 'matrix',
    },
    nrs: {
        name: 'normalGameResult',
    },
    mtx0: {
        name: 'matrix0',
    },
    pLn: {
        name: 'pLines',
    },
    c: {
        name: 'cChar',
    },
    frs: {
        name: 'freeGameResult',
    },
    brs: {
        name: 'bonusGameResult',
    },
    bcz: {
        name: 'bonusCrazy',
    },
    bcm: {
        name: 'bonusCommon'
    },
    bro: {
        name: 'bonusRoll'
    },
    ex: {
        name: 'extend',
    },
    isF: {
        name: 'isFinished',
        type: Boolean,
    },
    isT: {
        name: 'isTrialMode',
        type: Boolean,
    },
    tW: {
        name: 'trialWallet',
    },
    tJ: {
        name: 'trialJpl',
    },
    na: {
        name: 'normalGameWinAmount',
    },
    tJW: {
        name: 'trialJplWin'
    },
    baC: {
        name: 'bgWinAmtCurrent',
    },
    bLn: {
        name: 'betLines',
    },
    bty: {
        name: 'bType'
    },
    cPh: {
        name: 'cbPhase'
    },
    cbMtx: {
        name: 'cbMatrix'
    },
    pRe: {
        name: 'promotionRemain'
    },
    pTal: {
        name: 'promotionTotal'
    },
    pCd: {
        name: 'promotionCode'
    },
    rMx: {
        name: 'respinGameMatrix'
    },
    ra: {
        name: 'totalRespinWinAmount'
    },
    rLn: {
        name: 'respinGamePayLines'
    },
    rRe: {
        name: 'respinGameRemain'
    },
    tx: {
        name: 'totalBetMultiply'
    },
    ss: {
        name: 'subState'
    },
    cfa: {
        name: 'totalFreeSpinWinAmount'
    },
    cfRe: {
        name: 'trueFreeGameRemain'
    },
    lnMx: {
        name: 'lastNormalMatrix'
    },
    lnLn: {
        name: 'lastPaylinesMatrix'
    },
    wp: {
        name: 'wildPosition'
    },
    symV: {
        name: 'lastBonusSymbolCode',
        keepKey: true
    },
    wf: {
        name: 'wonFeature'
    },
    wst: {
        name: 'wonSymbolTotal'
    },
    uf: {
        name: 'usingFeature'
    },
    fr: {
        name: 'featureResult'
    },
    pro: {
        name: 'promotion'
    },
    rf: {
        name: 'runFeature'
    },

    // join game
    exD : {
        name : 'extendData',
    },
    mtD: {
        name: 'metaData'
    },
    mDP: {
        name: 'metaDataPromotion'
    },
    mb: {
        name: 'mBet'
    },
    eb: {
        name: 'eBet'
    },
    eba: {
        name: 'extraBonusGameWinAmount'
    },
    ed: {
        name: 'eData'
    },
    gCN : {
        name : 'groupChannelName'
    },
    jp : {
        name : 'jackpot'
    },
    // slot spin request
    serviceId : {
        name : 'sId'
    },
    commandId : {
        name : 'cId'
    },
    token : {
        name : 'tkn'
    },
    betId : {
        name : 'bId'
    },
    betLines : {
        name : 'bLn'
    },
    openCell : {
        name : 'cOp'
    },
    option : {
        name: 'opt',
    },
    // error push
    cd : {
        name : 'code'
    },
    cbMx: {
        name: 'commonBonusMatrix'
    },
    czy: {
        name: 'crazy'
    },
    bi: {
        name: 'bInfo'
    },
    ji: {
        name: 'jpInfo'
    },
    mx: {
        name: 'matrix'
    },
    mx0: {
        name: 'matrix0'
    },
    s: {
        name: 'state'
    },
    pl:  {
        name: 'payLines'
    },
    fg: {
        name: 'freeGame'
    },
    opt: {
        name: 'selectedOption',
    },
    fo: {
        name: 'freeOption',
    },
    foi: {
        name: 'freeOptionId',
    },
    bg:{
        name: 'bonusGame'
    },
    nsm: {
        name: 'normalSubSymbol'
    },
    fsm: {
        name: 'freeSubSymbol'
    },
    wm: {
        name: 'wildMultiply'
    },
    wt: {
        name: 'winType'
    },
    bwa: {
        name: "bigWinAmount" 
    },
    bwc: {
        name: 'bigWinConfig'
    },
    sw: {
        name: 'sureWin'
    },
    cMx: {
        name: 'crazyMatrix'
    },
    bPh: {
        name: 'bloonPhase'
    },
    wPh1: {
        name: 'winAmountPhase1'
    },
    code: {
        name: 'c'
    },
    sty: {
        name: 'stickyReels'
    },
    abro: {
        name: "allBonusRoll"
    },
    nbro: {
        name: "normalBonusRolls"
    },
    nxbro: {
        name: "nextBonusRolls"
    },
    fbro: {
        name: "freeBonusRolls"
    },
    mul: {
        name: "multiplier",
        keepKey: true
    },
    rmul: {
        name: "rightMultiply" 
    },
    lmul: {
        name: "leftMultiply" 
    },
    frmul: {
        name: "freeRightMultiply" 
    },
    flmul: {
        name: "freeLeftMultiply" 
    },
    ca: {
        name: "creditAmount",
    },
    nud: {
        name: "nudges"
    },
    swf: {
        name: "stackWilds",
    },
    nsw: {
        name: "normalStackWilds",
    },
    fsw: {
        name: "freeStackWilds",
    },
    fea: {
        name: "featureEffect"
    },
    s0: {
        name: "scatter"
    },
    s1: {
        name: "scatter1"
    },
    s2: {
        name: "scatter2"
    },
    tsc: {
        name: "totalScatterCredit"
    },
    ssi: {
        name: "sumScatterInfo"
    },
    frRe: {
        name: "freeRespinRemain"
    },
    nrRe: {
        name: "normalRespinRemain"
    },
    rpl: {
        name: "rightNormalGamePayLines" 
    },
    rnLn: {
        name: "rightNormalGamePayLines" 
    },
    rtwa: {
        name: "rightNormalGameWinAmountTotal" 
    },
    ltwa: {
        name: "leftNormalGameWinAmountTotal" 
    },
    rtna: {
        name: "rightNormalGameWinAmount" 
    },
    lfna: {
        name: "leftNormalGameWinAmount" 
    },
    rtfa: {
        name: "rightFreeGameWinAmount" 
    },
    lffa: {
        name: "leftFreeGameWinAmount" 
    },
    rfLn: {
        name: "rightFreeGamePayLines" 
    },
    rtnra: {
        name: "rightRespinGameWinAmount" 
    },
    lfnra: {
        name: "leftRespinGameWinAmount" 
    },
    nra: {
        name: "respinNormalGameWinAmount" 
    },
    fra: {
        name: "respinFreeGameWinAmount" 
    },
    rrLn: {
        name: "rightRespinGamePayLines" 
    },
};

module.exports = MsgKeyMapping;
