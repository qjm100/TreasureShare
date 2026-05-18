package com.ruoyi.web.controller.toy;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.toy.domain.ToyOrder;
import com.ruoyi.toy.service.IToyOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

/**
 * 订单Controller
 *
 * @author Ciami
 */
@RestController
@RequestMapping("/api/toy/orders")
public class OrderController extends BaseController
{
    @Autowired
    private IToyOrderService orderService;

    /**
     * 获取订单列表
     */
    @GetMapping
    public Object list(ToyOrder order, HttpServletRequest request)
    {
        if (request.getParameter("pageNum") != null)
        {
            startPage();
            List<ToyOrder> list = orderService.selectOrderList(order);
            return getDataTable(list);
        }
        return success(orderService.selectOrderList(order));
    }

    /**
     * 获取订单详细信息
     */
    @GetMapping("/{id}")
    public AjaxResult getInfo(@PathVariable Long id)
    {
        return success(orderService.selectOrderById(id));
    }

    /**
     * 创建订单
     */
    @PostMapping
    public AjaxResult create(@RequestBody Map<String, Long> body)
    {
        Long addressId = body.get("addressId");
        return success(orderService.createOrder(addressId));
    }

    /**
     * 支付订单
     */
    @PutMapping("/{id}/pay")
    public AjaxResult pay(@PathVariable Long id)
    {
        return toAjax(orderService.payOrder(id));
    }

    /**
     * 确认收货
     */
    @PutMapping("/{id}/receive")
    public AjaxResult receive(@PathVariable Long id)
    {
        return toAjax(orderService.confirmReceive(id));
    }

    /**
     * 申请归还
     */
    @PutMapping("/{id}/return")
    public AjaxResult applyReturn(@PathVariable Long id, @RequestBody Map<String, String> body)
    {
        return toAjax(orderService.applyReturn(id, body.get("returnLogisticsNo")));
    }

    /**
     * 获取卖家订单列表（我租出去的）
     */
    @GetMapping("/seller")
    public Object sellerOrders(HttpServletRequest request)
    {
        if (request.getParameter("pageNum") != null)
        {
            startPage();
            List<ToyOrder> list = orderService.selectSellerOrderList();
            return getDataTable(list);
        }
        return success(orderService.selectSellerOrderList());
    }

    /**
     * 续租
     */
    @PutMapping("/{id}/renew")
    public AjaxResult renew(@PathVariable Long id)
    {
        return toAjax(orderService.renewOrder(id));
    }

    /**
     * 发货
     */
    @PutMapping("/{id}/ship")
    public AjaxResult ship(@PathVariable Long id, @RequestBody Map<String, String> body)
    {
        return toAjax(orderService.shipOrder(id, body.get("logisticsNo")));
    }

    /**
     * 确认归还
     */
    @PutMapping("/{id}/confirm-return")
    public AjaxResult confirmReturn(@PathVariable Long id)
    {
        return toAjax(orderService.confirmReturn(id));
    }

    /**
     * 消毒完成
     */
    @PutMapping("/{id}/disinfect")
    public AjaxResult disinfect(@PathVariable Long id)
    {
        return toAjax(orderService.disinfectComplete(id));
    }

    /**
     * 取消订单
     */
    @PutMapping("/{id}/cancel")
    public AjaxResult cancel(@PathVariable Long id)
    {
        return toAjax(orderService.cancelOrder(id));
    }
}
