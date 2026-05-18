package com.ruoyi.toy.service.impl;

import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.toy.domain.ToyAddress;
import com.ruoyi.toy.domain.ToyCart;
import com.ruoyi.toy.domain.ToyOrder;
import com.ruoyi.toy.domain.ToyOrderItem;
import com.ruoyi.toy.domain.ToyProduct;
import com.ruoyi.toy.mapper.ToyAddressMapper;
import com.ruoyi.toy.mapper.ToyCartMapper;
import com.ruoyi.toy.mapper.ToyOrderItemMapper;
import com.ruoyi.toy.mapper.ToyOrderMapper;
import com.ruoyi.toy.mapper.ToyProductMapper;
import com.ruoyi.toy.service.IToyOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

/**
 * 订单Service业务层处理
 *
 * @author Ciami
 */
@Service
public class ToyOrderServiceImpl implements IToyOrderService
{
    @Autowired
    private ToyOrderMapper orderMapper;

    @Autowired
    private ToyOrderItemMapper orderItemMapper;

    @Autowired
    private ToyCartMapper cartMapper;

    @Autowired
    private ToyProductMapper productMapper;

    @Autowired
    private ToyAddressMapper addressMapper;

    /**
     * 查询订单列表
     */
    @Override
    public List<ToyOrder> selectOrderList(ToyOrder order)
    {
        order.setUserId(SecurityUtils.getUserId());
        List<ToyOrder> list = orderMapper.selectOrderList(order);
        for (ToyOrder o : list)
        {
            o.setItems(orderItemMapper.selectItemsByOrderId(o.getId()));
        }
        return list;
    }

    /**
     * 根据ID查询订单
     */
    @Override
    public ToyOrder selectOrderById(Long id)
    {
        ToyOrder order = orderMapper.selectOrderById(id);
        if (order != null)
        {
            order.setItems(orderItemMapper.selectItemsByOrderId(id));
        }
        return order;
    }

    /**
     * 创建订单
     */
    @Override
    @Transactional
    public Long createOrder(Long addressId)
    {
        Long userId = SecurityUtils.getUserId();

        // 获取购物车列表
        List<ToyCart> cartList = cartMapper.selectCartList(userId);
        if (cartList == null || cartList.isEmpty())
        {
            throw new ServiceException("购物车为空");
        }

        // 验证地址
        ToyAddress address = addressMapper.selectAddressById(addressId);
        if (address == null)
        {
            throw new ServiceException("收货地址不存在");
        }

        // 验证不能购买自己的商品
        for (ToyCart item : cartList)
        {
            ToyProduct product = productMapper.selectProductById(item.getProductId());
            if (product != null && userId.equals(product.getUserId()))
            {
                throw new ServiceException("不能购买自己发布的商品");
            }
        }

        // 计算租金和押金
        BigDecimal totalRent = BigDecimal.ZERO;
        for (ToyCart item : cartList)
        {
            BigDecimal rent = item.getRentPriceMonth().multiply(BigDecimal.valueOf(item.getDuration()));
            totalRent = totalRent.add(rent);
        }
        BigDecimal deposit = totalRent.multiply(BigDecimal.valueOf(2));

        // 创建订单
        ToyOrder order = new ToyOrder();
        order.setOrderNo("TOY" + System.currentTimeMillis() + (userId % 10000));
        order.setUserId(userId);
        order.setAddressId(addressId);
        order.setTotalRent(totalRent);
        order.setDeposit(deposit);
        order.setStatus("0");
        orderMapper.insertOrder(order);

        // 创建订单项
        for (ToyCart item : cartList)
        {
            ToyOrderItem orderItem = new ToyOrderItem();
            orderItem.setOrderId(order.getId());
            orderItem.setProductId(item.getProductId());
            orderItem.setQuantity(1);
            orderItem.setRentPrice(item.getRentPriceMonth());
            orderItem.setDuration(item.getDuration());
            orderItemMapper.insertOrderItem(orderItem);
        }

        // 清空购物车
        for (ToyCart item : cartList)
        {
            cartMapper.deleteCartById(item.getId());
        }

        return order.getId();
    }

    /**
     * 支付订单
     */
    @Override
    @Transactional
    public int payOrder(Long orderId)
    {
        ToyOrder order = orderMapper.selectOrderById(orderId);
        if (order == null)
        {
            throw new ServiceException("订单不存在");
        }
        if (!"0".equals(order.getStatus()))
        {
            throw new ServiceException("订单状态不正确");
        }

        // 扣减库存
        List<ToyOrderItem> items = orderItemMapper.selectItemsByOrderId(orderId);
        for (ToyOrderItem item : items)
        {
            ToyProduct product = productMapper.selectProductById(item.getProductId());
            if (product == null)
            {
                throw new ServiceException("商品不存在");
            }
            if (product.getStock() < 1)
            {
                throw new ServiceException("商品库存不足");
            }
            product.setStock(product.getStock() - 1);
            productMapper.updateProduct(product);
        }

        order.setStatus("1");
        order.setPayTime(new Date());
        return orderMapper.updateOrder(order);
    }

    /**
     * 发货
     */
    @Override
    public int shipOrder(Long orderId, String logisticsNo)
    {
        ToyOrder order = orderMapper.selectOrderById(orderId);
        if (order == null)
        {
            throw new ServiceException("订单不存在");
        }
        if (!"1".equals(order.getStatus()))
        {
            throw new ServiceException("订单状态不正确");
        }
        order.setStatus("2");
        order.setLogisticsNo(logisticsNo);
        return orderMapper.updateOrder(order);
    }

    /**
     * 确认收货（租赁开始）
     */
    @Override
    public int confirmReceive(Long orderId)
    {
        ToyOrder order = orderMapper.selectOrderById(orderId);
        if (order == null)
        {
            throw new ServiceException("订单不存在");
        }
        if (!"2".equals(order.getStatus()))
        {
            throw new ServiceException("订单状态不正确");
        }
        order.setStatus("3");
        return orderMapper.updateOrder(order);
    }

    /**
     * 查询卖家订单列表
     */
    @Override
    public List<ToyOrder> selectSellerOrderList()
    {
        Long userId = SecurityUtils.getUserId();
        List<ToyOrder> list = orderMapper.selectSellerOrders(userId);
        for (ToyOrder o : list)
        {
            o.setItems(orderItemMapper.selectItemsByOrderId(o.getId()));
        }
        return list;
    }

    /**
     * 申请归还
     */
    @Override
    public int applyReturn(Long orderId, String returnLogisticsNo)
    {
        ToyOrder order = orderMapper.selectOrderById(orderId);
        if (order == null)
        {
            throw new ServiceException("订单不存在");
        }
        if (!"3".equals(order.getStatus()))
        {
            throw new ServiceException("订单状态不正确");
        }
        order.setStatus("4");
        order.setReturnLogisticsNo(returnLogisticsNo);
        return orderMapper.updateOrder(order);
    }

    /**
     * 确认归还（管理员确认收到归还物品，进入待消毒状态）
     */
    @Override
    public int confirmReturn(Long orderId)
    {
        ToyOrder order = orderMapper.selectOrderById(orderId);
        if (order == null)
        {
            throw new ServiceException("订单不存在");
        }
        if (!"4".equals(order.getStatus()))
        {
            throw new ServiceException("订单状态不正确");
        }
        order.setStatus("5");
        return orderMapper.updateOrder(order);
    }

    /**
     * 续租
     */
    @Override
    public int renewOrder(Long orderId)
    {
        ToyOrder order = orderMapper.selectOrderById(orderId);
        if (order == null)
        {
            throw new ServiceException("订单不存在");
        }
        if (!"3".equals(order.getStatus()))
        {
            throw new ServiceException("订单状态不正确");
        }
        // 续租逻辑：延长租赁期，增加每个订单项的duration
        List<ToyOrderItem> items = orderItemMapper.selectItemsByOrderId(orderId);
        for (ToyOrderItem item : items)
        {
            item.setDuration(item.getDuration() + 1);
        }
        // 更新订单总租金
        BigDecimal additionalRent = BigDecimal.ZERO;
        for (ToyOrderItem item : items)
        {
            additionalRent = additionalRent.add(item.getRentPrice().multiply(BigDecimal.valueOf(item.getDuration())));
        }
        order.setTotalRent(order.getTotalRent().add(additionalRent));
        return orderMapper.updateOrder(order);
    }

    /**
     * 取消订单
     */
    @Override
    @Transactional
    public int cancelOrder(Long orderId)
    {
        ToyOrder order = orderMapper.selectOrderById(orderId);
        if (order == null)
        {
            throw new ServiceException("订单不存在");
        }
        String status = order.getStatus();
        if (!"0".equals(status) && !"1".equals(status))
        {
            throw new ServiceException("当前状态不可取消");
        }

        // 如果已支付，恢复库存
        if ("1".equals(status))
        {
            List<ToyOrderItem> items = orderItemMapper.selectItemsByOrderId(orderId);
            for (ToyOrderItem item : items)
            {
                ToyProduct product = productMapper.selectProductById(item.getProductId());
                if (product != null)
                {
                    product.setStock(product.getStock() + item.getQuantity());
                    productMapper.updateProduct(product);
                }
            }
        }

        order.setStatus("7");
        return orderMapper.updateOrder(order);
    }

    /**
     * 消毒完成
     */
    @Override
    @Transactional
    public int disinfectComplete(Long orderId)
    {
        ToyOrder order = orderMapper.selectOrderById(orderId);
        if (order == null)
        {
            throw new ServiceException("订单不存在");
        }
        if (!"5".equals(order.getStatus()))
        {
            throw new ServiceException("订单状态不正确");
        }

        // 恢复库存
        List<ToyOrderItem> items = orderItemMapper.selectItemsByOrderId(orderId);
        for (ToyOrderItem item : items)
        {
            ToyProduct product = productMapper.selectProductById(item.getProductId());
            if (product != null)
            {
                product.setStock(product.getStock() + 1);
                productMapper.updateProduct(product);
            }
        }

        order.setStatus("6");
        return orderMapper.updateOrder(order);
    }
}
