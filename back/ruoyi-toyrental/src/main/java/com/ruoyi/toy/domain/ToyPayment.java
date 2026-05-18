package com.ruoyi.toy.domain;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 支付记录对象 toy_payment
 *
 * @author Ciami
 */
public class ToyPayment implements Serializable
{
    private static final long serialVersionUID = 1L;

    private Long id;

    private Long orderId;

    private BigDecimal amount;

    private String type;

    private String method;

    private String status;

    private Date payTime;

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

    public BigDecimal getAmount()
    {
        return amount;
    }

    public void setAmount(BigDecimal amount)
    {
        this.amount = amount;
    }

    public String getType()
    {
        return type;
    }

    public void setType(String type)
    {
        this.type = type;
    }

    public String getMethod()
    {
        return method;
    }

    public void setMethod(String method)
    {
        this.method = method;
    }

    public String getStatus()
    {
        return status;
    }

    public void setStatus(String status)
    {
        this.status = status;
    }

    public Date getPayTime()
    {
        return payTime;
    }

    public void setPayTime(Date payTime)
    {
        this.payTime = payTime;
    }
}
