package com.ruoyi.toy.domain;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 订单项对象 toy_order_item
 *
 * @author Ciami
 */
public class ToyOrderItem implements Serializable
{
    private static final long serialVersionUID = 1L;

    private Long id;

    private Long orderId;

    private Long productId;

    private Integer quantity;

    private BigDecimal rentPrice;

    private Integer duration;

    private String productName;

    private String productImage;

    public Long getId()
    {
        return id;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public Long getOrderId()
    {
        return orderId;
    }

    public void setOrderId(Long orderId)
    {
        this.orderId = orderId;
    }

    public Long getProductId()
    {
        return productId;
    }

    public void setProductId(Long productId)
    {
        this.productId = productId;
    }

    public Integer getQuantity()
    {
        return quantity;
    }

    public void setQuantity(Integer quantity)
    {
        this.quantity = quantity;
    }

    public BigDecimal getRentPrice()
    {
        return rentPrice;
    }

    public void setRentPrice(BigDecimal rentPrice)
    {
        this.rentPrice = rentPrice;
    }

    public Integer getDuration()
    {
        return duration;
    }

    public void setDuration(Integer duration)
    {
        this.duration = duration;
    }

    public String getProductName()
    {
        return productName;
    }

    public void setProductName(String productName)
    {
        this.productName = productName;
    }

    public String getProductImage()
    {
        return productImage;
    }

    public void setProductImage(String productImage)
    {
        this.productImage = productImage;
    }
}
