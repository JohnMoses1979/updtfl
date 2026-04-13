// package com.blisssierra.hrms.repository;

// import java.util.List;

// import org.springframework.data.jpa.repository.JpaRepository;

// import com.blisssierra.hrms.entity.AdminMessage;

// public interface AdminMessageRepository extends JpaRepository<AdminMessage, Long> {

//     List<AdminMessage> findByRecipientEmployeeIdOrderByCreatedAtDesc(String recipientEmployeeId);
// }

package com.blisssierra.hrms.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.blisssierra.hrms.entity.AdminMessage;

public interface AdminMessageRepository extends JpaRepository<AdminMessage, Long> {

    List<AdminMessage> findByRecipientEmployeeIdOrderByCreatedAtDesc(String recipientEmployeeId);

    // ISSUE 4 FIX: Find messages newer than a given timestamp
    List<AdminMessage> findByRecipientEmployeeIdAndCreatedAtAfterOrderByCreatedAtDesc(
            String recipientEmployeeId, LocalDateTime after);

    // Delete messages older than cutoff
    @Modifying
    @Transactional
    @Query("DELETE FROM AdminMessage m WHERE m.createdAt < :cutoff")
    void deleteByCreatedAtBefore(@Param("cutoff") LocalDateTime cutoff);
}