package com.ruoyi.toy.domain;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 订单对象 toy_order
 *
 * @author Ciami
 */
public class ToyOrder extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    private Long id;

    private String orderNo;

    private Long userId;

    private Long addressId;

    private BigDecimal totalRent;

    private BigDecimal deposit;

    private String status;

    private Date payTime;

    private String logisticsNo;

    private String returnLogisticsNo;

    private List<ToyOrderItem> items;

    private String receiverName;

    private String receiverPhone;

    private String receiverAddress;

    public Long getId()
    {
        return id;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public String getOrderNo()
    {
        return orderNo;
    }

    public void setOrderNo(String orderNo)
    {
        this.orderNo = orderNo;
    }

    public Long getUserId()
    {
        return userId;
    }

    public void setUserId(Long userId)
    {
        this.userId = userId;
    }

    public Long getAddressId()
    {
        return addressId;
    }

    public void setAddressId(Long addressId)
    {
        this.addressId = addressId;
    }

    public BigDecimal getTotalRent()
    {
        return totalRent;
    }

    public void setTotalRent(BigDecimal totalRent)
    {
        this.totalRent = totalRent;
    }

    public BigDecimal getDeposit()
    {
        return deposit;
    }

    public void setDeposit(BigDecimal deposit)
    {
        this.deposit = deposit;
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

    public String getLogisticsNo()
    {
        return logisticsNo;
    }

    public void setLogisticsNo(String logisticsNo)
    {
        this.logisticsNo = logisticsNo;
    }

    public String getReturnLogisticsNo()
    {
        return returnLogisticsNo;
    }

    public void setReturnLogisticsNo(String returnLogisticsNo)
    {
        this.returnLogisticsNo = returnLogisticsNo;
    }

    public List<ToyOrderItem> getItems()
    {
        return items;
    }

    public void setItems(List<ToyOrderItem> items)
    {
        this.items = items;
    }

    public String getReceiverName()
    {
        return receiverName;
    }

    public void setReceiverName(String receiverName)
    {
        this.receiverName = receiverName;
    }

    public String getReceiverPhone()
    {
        return receiverPhone;
    }

    public void setReceiverPhone(String receiverPhone)
    {
        this.receiverPhone = receiverPhone;
    }

    public String getReceiverAddress()
    {
        return receiverAddress;
    }

    public void setReceiverAddress(String receiverAddress)
    {
        this.receiverAddress = receiverAddress;
    }
}
