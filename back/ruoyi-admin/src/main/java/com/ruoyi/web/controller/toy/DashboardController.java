package com.ruoyi.web.controller.toy;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.toy.service.IToyUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

@RestController
@RequestMapping("/api/toy/dashboard")
public class DashboardController extends BaseController
{
    @Autowired
    private DataSource dataSource;

    @GetMapping("/stats")
    public AjaxResult stats()
    {
        Map<String, Object> result = new HashMap<>();
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement())
        {
            ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM sys_user WHERE del_flag = '0'");
            if (rs.next()) result.put("totalUsers", rs.getLong(1));
            rs.close();

            rs = stmt.executeQuery("SELECT COUNT(*) FROM toy_product WHERE status = '0'");
            if (rs.next()) result.put("totalProducts", rs.getLong(1));
            rs.close();

            rs = stmt.executeQuery("SELECT COUNT(*) FROM toy_order WHERE DATE(create_time) = CURDATE()");
            if (rs.next()) result.put("todayOrders", rs.getLong(1));
            rs.close();

            rs = stmt.executeQuery("SELECT COUNT(*) FROM toy_order WHERE status IN ('1','2','3','4','5')");
            if (rs.next()) result.put("activeOrders", rs.getLong(1));
            rs.close();

            int[] statusCounts = new int[8];
            rs = stmt.executeQuery("SELECT status, COUNT(*) cnt FROM toy_order GROUP BY status");
            while (rs.next())
            {
                int s = Integer.parseInt(rs.getString("status"));
                if (s >= 0 && s <= 7) statusCounts[s] = rs.getInt("cnt");
            }
            rs.close();
            Map<String, Integer> sc = new HashMap<>();
            for (int i = 0; i <= 7; i++) sc.put(String.valueOf(i), statusCounts[i]);
            result.put("statusCounts", sc);
        }
        catch (Exception e)
        {
            return error(e.getMessage());
        }
        return success(result);
    }
}
