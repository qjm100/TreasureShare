package com.ruoyi.toy.domain;

import java.io.Serializable;
import java.util.Date;

/**
 * 物流记录对象 toy_logistics
 *
 * @author Ciami
 */
public class ToyLogistics implements Serializable
{
    private static final long serialVersionUID = 1L;

    private Long id;

    private Long orderId;

    private String trackingNo;

    private String company;

    private String type;

    private String status;

    private Date createTime;

    private Date updateTime;

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

    public String getTrackingNo()
    {
        return trackingNo;
    }

    public void setTrackingNo(String trackingNo)
    {
        this.trackingNo = trackingNo;
    }

    public String getCompany()
    {
        return company;
    }

    public void setCompany(String company)
    {
        this.company = company;
    }

    public String getType()
    {
        return type;
    }

    public void setType(String type)
    {
        this.type = type;
    }

    public String getStatus()
    {
        return status;
    }

    public void setStatus(String status)
    {
        this.status = status;
    }

    public Date getCreateTime()
    {
        return createTime;
    }

    public void setCreateTime(Date createTime)
    {
        this.createTime = createTime;
    }

    public Date getUpdateTime()
    {
        return updateTime;
    }

    public void setUpdateTime(Date updateTime)
    {
        this.updateTime = updateTime;
    }
}
