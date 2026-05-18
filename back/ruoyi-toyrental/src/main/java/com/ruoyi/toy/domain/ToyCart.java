package com.ruoyi.toy.domain;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 购物车对象 toy_cart
 *
 * @author Ciami
 */
public class ToyCart implements Serializable
{
    private static final long serialVersionUID = 1L;

    private Long id;

    private Long userId;

    private Long productId;

    private Integer duration;

    private Date createTime;

    private String productName;

    private String productImage;

    private BigDecimal rentPriceMonth;

    public Long getId()
    {
        return id;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public Long getUserId()
    {
        return userId;
    }

    public void setUserId(Long userId)
    {
        this.userId = userId;
    }

    public Long getProductId()
    {
        return productId;
    }

    public void setProductId(Long productId)
    {
        this.productId = productId;
    }

    public Integer getDuration()
    {
        return duration;
    }

    public void setDuration(Integer duration)
    {
        this.duration = duration;
    }

    public Date getCreateTime()
    {
        return createTime;
    }

    public void setCreateTime(Date createTime)
    {
        this.createTime = createTime;
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

    public BigDecimal getRentPriceMonth()
    {
        return rentPriceMonth;
    }

    public void setRentPriceMonth(BigDecimal rentPriceMonth)
    {
        this.rentPriceMonth = rentPriceMonth;
    }
}
