const reportService = require('../services/reportService');
const { asyncHandler } = require('../middleware/errorHandler');

// Generate stock status report
exports.getStockStatusReport = asyncHandler(async (req, res) => {
  try {
    const filters = {
      urun_kodu: req.query.urun_kodu
    };
    
    const report = await reportService.generateStockStatusReport(filters);
    
    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Stok raporu oluşturma hatası:', error);
    return res.status(500).json({
      success: false,
      error: 'Stok raporu oluşturulurken bir hata meydana geldi'
    });
  }
});

// Generate order status report
exports.getOrderStatusReport = asyncHandler(async (req, res) => {
  try {
    const filters = {
      tedarikci_id: req.query.tedarikci_id,
      durum: req.query.durum
    };
    
    const report = await reportService.generateOrderStatusReport(filters);
    
    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Sipariş raporu oluşturma hatası:', error);
    return res.status(500).json({
      success: false,
      error: 'Sipariş raporu oluşturulurken bir hata meydana geldi'
    });
  }
});

// Generate supplier performance report
exports.getSupplierReport = asyncHandler(async (req, res) => {
  try {
    const filters = {};
    
    const report = await reportService.generateSupplierReport(filters);
    
    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Tedarikçi raporu oluşturma hatası:', error);
    return res.status(500).json({
      success: false,
      error: 'Tedarikçi raporu oluşturulurken bir hata meydana geldi'
    });
  }
});
