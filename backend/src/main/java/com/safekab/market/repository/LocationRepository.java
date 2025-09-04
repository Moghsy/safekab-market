package com.safekab.market.repository;

import com.safekab.market.entity.Location;
import com.safekab.market.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {
    @Query("SELECT l FROM Location l WHERE l.line1 = :line1 AND l.line2 = :line2 AND l.city = :city AND l.postalCode = :postalCode AND l.country = :country AND l.user = :user")
    Optional<Location> findByAddressAndUser(@Param("line1") String line1,
                                            @Param("line2") String line2,
                                            @Param("city") String city,
                                            @Param("postalCode") String postalCode,
                                            @Param("country") String country,
                                            @Param("user") User user);
}
